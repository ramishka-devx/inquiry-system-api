// src/users/category.module.ts
import { Module } from '@nestjs/common';
import { CategoriesService } from './category.service';
import { CategoriesController } from './categorycontroller';


@Module({
  providers: [CategoriesService],
  controllers: [CategoriesController],
  exports: [CategoriesService],
})
export class categoriesModule {}