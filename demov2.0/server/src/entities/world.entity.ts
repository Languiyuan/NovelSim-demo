import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Save } from './save.entity';

@Entity('world')
@Index('idx_save_status', ['saveId', 'status'])
export class World {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  saveId: number;

  @Column({ type: 'varchar', length: 64 })
  name: string;

  @Column({ type: 'varchar', length: 16, default: '凡界' })
  worldType: string;

  @Column({ type: 'text', nullable: true })
  geography: string | null;

  @Column({ type: 'text', nullable: true })
  history: string | null;

  @Column({ type: 'json', nullable: true })
  factions: any;

  @Column({ type: 'json', nullable: true })
  rules: any;

  @Column({ type: 'varchar', length: 16, default: '化神期' })
  maxRealm: string;

  @Column({ type: 'enum', enum: ['current', 'past'], default: 'current' })
  status: 'current' | 'past';

  @Column({ type: 'int', default: 1 })
  seq: number;

  @ManyToOne(() => Save, (save) => save.worlds)
  @JoinColumn({ name: 'saveId' })
  save: Save;
}
