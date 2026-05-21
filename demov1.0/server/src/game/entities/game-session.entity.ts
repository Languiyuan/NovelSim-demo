import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { StoryNode } from './story-node.entity';

export interface CharacterStats {
  hp: number;
  mp: number;
  atk: number;
  def: number;
  luck: number;
  cultivation: number;
  achievements: string[];
}

@Entity('game_session')
export class GameSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'character_name', length: 50, default: '李青云' })
  characterName: string;

  @Column({ length: 50, default: '练气中期' })
  realm: string;

  @Column({ name: 'state_json', type: 'json' })
  stateJson: {
    name: string;
    realm: string;
    storyPhase: string;
    history: string[];
    characterStats: CharacterStats;
    narrativeSegmentCount: number;
  };

  @Column({ type: 'enum', enum: ['active', 'ended'], default: 'active' })
  status: 'active' | 'ended';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => StoryNode, (node) => node.session)
  storyNodes: StoryNode[];
}
