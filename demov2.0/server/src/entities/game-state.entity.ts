import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToOne, JoinColumn, UpdateDateColumn,
} from 'typeorm';
import { Save } from './save.entity';
import { StructuredGameState } from '../shared/interfaces';

@Entity('game_state')
export class GameState {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, unique: true })
  saveId: number;

  @Column({ type: 'json' })
  state: StructuredGameState;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ type: 'int', default: 0 })
  summaryVersion: number;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Save, (save) => save.gameState)
  @JoinColumn({ name: 'saveId' })
  save: Save;
}
