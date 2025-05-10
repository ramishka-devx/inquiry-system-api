// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MySQLModule } from './mysql/mysql.module';
import { categoriesModule } from './categories/category.module';
import { complainModule } from './complains/complain.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MySQLModule,
    AuthModule,
    UsersModule,
    categoriesModule,
    complainModule
  ],
})
export class AppModule {}