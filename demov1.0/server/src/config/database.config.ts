import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'xiuxian123',
  database: process.env.DB_NAME || 'xiuxian_demo',
  autoLoadEntities: true,
  synchronize: true,
  charset: 'utf8mb4',
});
