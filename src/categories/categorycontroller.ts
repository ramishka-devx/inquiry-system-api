// src/categories/categories.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { CategoriesService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  // Create category
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('category.create')
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  // Get all categories
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('search') search: string, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.categoriesService.findAll(search, page, limit);
  }

  // Get category by ID
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('category.read')
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.categoriesService.findOne(id);
  }

  // Update category
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('category.update')
  @Put(':id')
  update(@Param('id') id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  // Delete category
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('category.delete')
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.categoriesService.remove(id);
  }

  // ======================================================
  // secondary methods
  // ======================================================

  // asign category in charge :: TODO
  @UseGuards(JwtAuthGuard, PermissionsGuard)  
  @Permissions('category.asign')
  @Post(':id/asign')
  asign(@Param('id') id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.asign(id, updateCategoryDto);
  }
}
