import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, Index,
} from 'typeorm';
import { Save } from './save.entity';

@Entity('node')
@Index('idx_save_created', ['saveId', 'createdAt'])
@Index('idx_branch_group', ['branchGroupId'])
export class GameNode {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  saveId: number;

  @Column({ type: 'varchar', length: 16 })
  realm: string;

  @Column({ type: 'varchar', length: 16 })
  nodeType: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  subType: string | null;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'json', nullable: true })
  choices: any;

  @Column({ type: 'tinyint', nullable: true })
  chosenIndex: number | null;

  @Column({ type: 'json', nullable: true })
  stateChanges: any;

  @Column({ type: 'tinyint', default: 0 })
  isPregenerated: number;

  @Column({ type: 'varchar', length: 36, nullable: true })
  branchGroupId: string | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  parentNodeId: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Save, (save) => save.nodes)
  @JoinColumn({ name: 'saveId' })
  save: Save;
}
