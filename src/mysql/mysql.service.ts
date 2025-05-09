// src/mysql/mysql.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { databaseConfig } from '../config/database.config';

@Injectable()
export class MySQLService implements OnModuleInit, OnModuleDestroy {
  private pool: mysql.Pool;

  async onModuleInit() {
    this.pool = mysql.createPool({
      host: databaseConfig.host,
    //   port: databaseConfig.port,
      user: databaseConfig.username,
      password: databaseConfig.password,
      database: databaseConfig.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    
    // Initialize database tables if they don't exist
    await this.initTables();
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  private async initTables() {
    // Create users table if not exists
    await this.pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        fullName VARCHAR(255),
        bio TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    const [results] = await this.pool.execute(sql, params);
    return results;
  }
}