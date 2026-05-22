import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { CharacterService } from './services/character.service';
import { NodeService } from './services/node.service';
import { BattleService } from './services/battle.service';
import { RealmService } from './services/realm.service';
import { AgentModule } from '../agent/agent.module';
import { User, Save, Role, GameState, World, GameNode, Npc } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Save, Role, GameState, World, GameNode, Npc]),
    AgentModule,
  ],
  controllers: [GameController],
  providers: [GameService, CharacterService, NodeService, BattleService, RealmService],
  exports: [GameService],
})
export class GameModule {}
