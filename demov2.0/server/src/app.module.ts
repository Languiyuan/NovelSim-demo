import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameModule } from './game/game.module';
import { AgentModule } from './agent/agent.module';
import { StreamModule } from './stream/stream.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get('DB_USER', 'root'),
        password: config.get('DB_PASSWORD', 'xiuxian123'),
        database: config.get('DB_NAME', 'xiuxian_v2'),
        autoLoadEntities: true,
        synchronize: true,
        charset: 'utf8mb4',
        retryAttempts: 10,
        retryDelay: 3000,
      }),
    }),
    AgentModule,
    GameModule,
    StreamModule,
  ],
})
export class AppModule {}
