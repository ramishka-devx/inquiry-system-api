// src/users/category.module.ts
import { Module } from '@nestjs/common';
import { ComplainsService } from './complains.service';
import { ComplainsController } from './complains.controller';


@Module({
  providers: [ComplainsService],
  controllers: [ComplainsController],
  exports: [ComplainsService],
})
export class complainModule {}