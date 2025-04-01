import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Url } from '../url.entity/url.entity';

@Entity()
export class Visit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Url, (url) => url.visitsLog, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'urlId' })
  url: Url;

  @CreateDateColumn()
  visitedAt: Date;
}
