import { Injectable, Inject } from '@nestjs/common';
import * as rethink from 'rethinkdb';

@Injectable()
export class AppService {
  private connection: rethink.Connection;

  constructor(@Inject('RethinkProvider') connection: rethink.Connection) {
    this.connection = connection;
  }

  async loadUsers(): Promise<any[]> {
    const result = await rethink
      .table('user')
      .orderBy('name')
      .run(this.connection)
      .then(cursor => {
        return cursor.toArray();
      });
    return result;
  }

  updateUser(data: { id: string; order: string }): void {
    rethink
      .table('user')
      .get(data.id)
      .update({ order: data.order })
      .run(this.connection);
  }

  deleteUser(id: string): void {
    rethink
      .table('user')
      .get(id)
      .delete()
      .run(this.connection);
  }

  addUser(data: string): void {
    rethink
      .table('user')
      .insert({
        order: data,
      })
      .run(this.connection);
  }
}
