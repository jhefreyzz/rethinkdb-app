import * as rethink from 'rethinkdb';
export const RethinkProvider = {
  provide: 'RethinkProvider',
  useFactory: async () => {
    const conn = await rethink.connect({
      host: 'localhost',
      port: 28015,
      db: 'flow',
    });
    return conn;
  },
};
