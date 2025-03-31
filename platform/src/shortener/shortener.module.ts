import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortenerService } from './shortener.service';
import { ShortenerController } from './shortener.controller';
import { Url } from './entities/url.entity/url.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Url])],
  controllers: [ShortenerController],
  providers: [ShortenerService],
  exports: [ShortenerService],
})
export class ShortenerModule {}