import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortenerService } from './shortener.service';
import { ShortenerController } from './shortener.controller';
import { Url } from './entities/url.entity/url.entity';
import { Visit } from './entities/visit.entity/visit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Url, Visit])],
  controllers: [ShortenerController],
  providers: [ShortenerService],
  exports: [ShortenerService],
})
export class ShortenerModule {}
