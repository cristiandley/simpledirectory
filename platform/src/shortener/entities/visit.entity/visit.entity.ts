import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Url } from '../url.entity/url.entity';

@Entity()
export class Visit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Url, (url) => url.visitsLog, {
    onDelete: 'CASCADE',
  })
  url: Url;

  @CreateDateColumn()
  visitedAt: Date;
}
