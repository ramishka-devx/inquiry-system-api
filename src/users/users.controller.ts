// src/users/users.controller.ts
import { Controller, Get, Body, Patch, UseGuards, Param, ParseIntPipe, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // get user profile by user
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('user.read')
  @Get('profile')
  getProfile(@GetUser('id') id: number) {
    return this.usersService.findOne(id);
  }

  // get all users by admin
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('user.read')
  @Get()
  async findAll(
    @Query('search') search: string = '',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.usersService.findAll(search, page, limit);
  }

  // get a user by admin
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('user.read')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  //update user profile by user
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  update(@GetUser('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  //update user by admin
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('user.update')
  @Patch(':id')
  updateByAdmin(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }
}