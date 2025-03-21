import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import express from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() request: express.Request): Promise<User> {
    const user: any = request.user;
    return this.userService.findOne(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<User> {
    // Validar que el ID proporcionado sea un número
    const userId = Number(id);
    if (isNaN(userId)) {
      throw new BadRequestException('User ID must be a number');
    }

    // Verificar si el email ya está en uso si se intenta actualizar
    if (updateUserDto.email) {
      const existingUser = await this.userService.findByEmail(
        updateUserDto.email
      );
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Email already in use');
      }
    }

    return this.userService.update(userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string
  ): Promise<{ success: boolean; message: string }> {
    const userId = Number(id);
    if (isNaN(userId)) {
      throw new BadRequestException('User ID must be a number');
    }

    await this.userService.remove(userId);
    return {
      success: true,
      message: `User with ID ${userId} has been successfully deleted`,
    };
  }
}
