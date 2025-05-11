// src/config/database.config.ts
export const databaseConfig = {
    host: process.env.DB_HOST || 'bvetmnoibz3w0zpqtedt-mysql.services.clever-cloud.com',
    username: process.env.DB_USERNAME || 'u4g99yqmc0z1sxxr',
    password: process.env.DB_PASSWORD || '10zbzOlsJGqc1igVXRc2',
    database: process.env.DB_NAME || 'bvetmnoibz3w0zpqtedt',
    port: process.env.DB_PORT || 3306
  };