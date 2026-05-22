import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Save } from './save.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 64, nullable: true, unique: true })
  wxOpenid: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true, unique: true })
  aliUserId: string | null;

  @Column({ type: 'varchar', length: 32, default: '' })
  nickname: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  avatar: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Save, (save) => save.user)
  saves: Save[];
}
