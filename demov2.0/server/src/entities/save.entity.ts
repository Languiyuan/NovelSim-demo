import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, OneToMany,
  JoinColumn, Index,
} from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';
import { GameState } from './game-state.entity';
import { World } from './world.entity';
import { GameNode } from './game-node.entity';
import { Npc } from './npc.entity';

@Entity('save')
@Index('idx_user_status', ['userId', 'status'])
export class Save {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Column({ type: 'varchar', length: 32 })
  name: string;

  @Column({ type: 'enum', enum: ['active', 'ended'], default: 'active' })
  status: 'active' | 'ended';

  @Column({ type: 'varchar', length: 16, nullable: true })
  endingType: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.saves)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToOne(() => Role, (role) => role.save)
  role: Role;

  @OneToOne(() => GameState, (gs) => gs.save)
  gameState: GameState;

  @OneToMany(() => World, (world) => world.save)
  worlds: World[];

  @OneToMany(() => GameNode, (node) => node.save)
  nodes: GameNode[];

  @OneToMany(() => Npc, (npc) => npc.save)
  npcs: Npc[];
}
