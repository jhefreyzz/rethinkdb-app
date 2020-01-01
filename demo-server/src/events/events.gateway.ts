import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import * as rethink from 'rethinkdb';
import { Inject, Logger } from '@nestjs/common';
import { AppService } from 'src/app.service';

@WebSocketGateway(4001)
export class EventsGateway {
  private connection: rethink.Connection;
  constructor(
    @Inject('RethinkProvider') connection: rethink.Connection,
    private readonly appService: AppService,
  ) {
    this.connection = connection;
  }

  private options: rethink.ChangesOptions = {
    squash: false,
    changefeedQueueSize: 100000,
    includeInitial: false,
    includeStates: false,
    includeOffsets: false,
    includeTypes: true,
  };

  @SubscribeMessage('stream')
  handleChangefeed(client: Socket): void {
    Logger.debug('Message received');
    rethink
      .table('user')
      .changes(this.options)
      .run(this.connection, (err, result) => {
        result.each((err, row) => {
          if (err) throw err;
          client.emit('feed', row);
        });
      });
  }

  @SubscribeMessage('add_user')
  handleAddUser(@MessageBody() data: string): void {
    this.appService.addUser(data);
  }
  @SubscribeMessage('delete_user')
  handleDeleteUser(@MessageBody() id: string): void {
    this.appService.deleteUser(id);
  }

  @SubscribeMessage('update_user')
  handleUpdateUser(@MessageBody() data: { id: string; order: string }): void {
    this.appService.updateUser(data);
  }
}
