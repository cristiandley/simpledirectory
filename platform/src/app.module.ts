import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShortenerModule } from './shortener/shortener.module';
import { Url } from './shortener/entities/url.entity/url.entity';
import { Visit } from './shortener/entities/visit.entity/visit.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Url, Visit],
      synchronize: true, // should not be here for production
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        limit: 20, // Might be low... but...
        ttl: 60000, // (60 seconds)
      },
    ]),
    ShortenerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
