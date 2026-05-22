import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToOne, JoinColumn,
} from 'typeorm';
import { Save } from './save.entity';

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, unique: true })
  saveId: number;

  @Column({ type: 'varchar', length: 32 })
  name: string;

  @Column({ type: 'int', default: 50 })
  jing: number;

  @Column({ type: 'int', default: 50 })
  qi: number;

  @Column({ type: 'int', default: 50 })
  shen: number;

  @Column({ type: 'int', default: 50 })
  talent: number;

  @Column({ type: 'int', default: 50 })
  wisdom: number;

  @Column({ type: 'int', default: 50 })
  luck: number;

  @Column({ type: 'varchar', length: 16, default: '练气初期' })
  realm: string;

  @Column({ type: 'int', default: 0 })
  exp: number;

  @Column({ type: 'int', default: 16 })
  age: number;

  @Column({ type: 'int', default: 100 })
  maxAge: number;

  @OneToOne(() => Save, (save) => save.role)
  @JoinColumn({ name: 'saveId' })
  save: Save;
}
