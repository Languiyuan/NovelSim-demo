import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GameSession } from './game-session.entity';

@Entity('story_node')
export class StoryNode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'session_id' })
  sessionId: number;

  @Column({ name: 'node_type', length: 20, default: 'narrative' })
  nodeType: string;

  @Column({ name: 'narrative_text', type: 'text' })
  narrativeText: string;

  @Column({ name: 'choices_json', type: 'json', nullable: true })
  choicesJson: { text: string; hint: string }[] | null;

  @Column({ name: 'chosen_index', type: 'int', nullable: true })
  chosenIndex: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => GameSession, (session) => session.storyNodes)
  @JoinColumn({ name: 'session_id' })
  session: GameSession;
}
