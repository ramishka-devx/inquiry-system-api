// src/complains/complains.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ComplainsService } from './complains.service';
import { CreateComplainDto } from './dto/create-complain.dto';
import { UpdateComplainDto } from './dto/update-complain.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { activityComplainDto } from './dto/activity-complain.dto';

@Controller('complains')
export class ComplainsController {
  constructor(private readonly complainsService: ComplainsService) { }

  // Create a new complain
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@GetUser('id') id: number, @Body() createComplainDto: CreateComplainDto) {
    return this.complainsService.create(createComplainDto, id);
  }

  // Get all complains
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('complain.read')
  @Get()
  findAll(@Query('search') search: string, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.complainsService.findAll(search, page, limit);
  }

  // get users complains
  @UseGuards(JwtAuthGuard)
  @Get('/my')
  findMyComplains(@GetUser('id') id: number, @Query('search') search: string, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.complainsService.findAll(search, page, limit, id);
  }

  // Get a complain by ID
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  // @Permissions('complain.read')
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.complainsService.findOne(id);
  }

  // updating is not allowed for complains :: Ramishka
  // // Update a complain
  // @Put(':id')
  // update(@Param('id') id: number, @Body() updateComplainDto: UpdateComplainDto) {
  //   return this.complainsService.update(id, updateComplainDto);
  // }

  // deleting is not allowed for complains :: Ramishka
  // Delete a complain
  // @Delete(':id')
  // remove(@Param('id') id: number) {
  //   return this.complainsService.remove(id);
  // }

  // ======================================================
  // secondary methods
  // ======================================================

  // create activity on complain
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('complain.activity.create')
  @Post(':id/activity')
  createActivity(@GetUser('id') id: number, @Param('id') complain_id: number, @Body() activityComplainDto: activityComplainDto) {
    return this.complainsService.createActivity(id, complain_id, activityComplainDto);
  } 
}
