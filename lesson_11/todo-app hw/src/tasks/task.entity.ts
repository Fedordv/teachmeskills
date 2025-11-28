import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tasks')
@Index(['ownerId', 'completed'])
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ default: false })
  completed: boolean;

  @Column()
  @Index()
  ownerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date | null;

  @Column({ nullable: true })
  priority?: 'high' | 'medium' | 'low';

  @Column({ type: 'timestamptz', nullable: true })
  deadline?: Date | null;
}

// 01648282-e123-4828-9226-0abef1225ede
