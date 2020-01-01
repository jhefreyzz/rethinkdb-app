import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { RethinkProvider } from 'src/providers/rethink-provider';
import { AppService } from 'src/app.service';

@Module({
  providers: [EventsGateway, RethinkProvider, AppService],
})
export class EventsModule {}
