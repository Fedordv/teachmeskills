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
  id: string; //uuid

  @Column({ length: 255 })
  title: string;

  @Column({ default: false })
  completed: boolean;

  @Column()
  @Index()
  ownerId: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn({ nullable: true })
  deleteAt?: Date | null;
}
