import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Save } from './save.entity';

@Entity('npc')
@Index('idx_save', ['saveId'])
export class Npc {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  saveId: number;

  @Column({ type: 'varchar', length: 32 })
  name: string;

  @Column({ type: 'varchar', length: 16 })
  type: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  personality: string | null;

  @Column({ type: 'int', default: 0 })
  affinity: number;

  @Column({ type: 'varchar', length: 16, default: '在世' })
  status: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @ManyToOne(() => Save, (save) => save.npcs)
  @JoinColumn({ name: 'saveId' })
  save: Save;
}
