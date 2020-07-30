import { MongoMemoryServer } from 'mongodb-memory-server';
import { Module, Injectable } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ICollection } from 'monk';
import {
  MonkModule,
  InjectCollection,
  InjectRepository,
  Model,
  Repository,
} from '../src';

@Injectable()
class MongoServer {
  private server: MongoMemoryServer;

  async startServer() {
    this.server = new MongoMemoryServer();

    await this.server.start();

    return this.server;
  }

  async stopServer() {
    await this.server.stop();
  }
}

@Module({
  providers: [MongoServer],
  exports: [MongoServer],
})
class MongoServerModule {}

/* USERS */
@Model()
class User {
  _id: string;
  name: string;
}

@Injectable()
class UserService {
  constructor(
    @InjectCollection(User) readonly usersCollection: ICollection<User>,
    @InjectRepository(User) readonly usersRepository: Repository<User>,
  ) {}
}

@Module({
  imports: [MonkModule.forFeatures([User])],
  providers: [UserService],
  exports: [UserService],
})
class UserModule {}
/* END USERS */

@Module({
  imports: [
    MonkModule.forRootAsync({
      database: {
        useFactory: async (ms: MongoServer) => {
          const server = await ms.startServer();
          return await server.getConnectionString();
        },
        inject: [MongoServer],
        imports: [MongoServerModule],
      },
    }),
    UserModule,
  ],
})
class AppRootModule {}

describe('MonkModule forRootAsync', () => {
  it('', async () => {
    jest.setTimeout(15000);

    const module = await NestFactory.createApplicationContext(AppRootModule, {
      logger: false,
    });

    const userService = module.get(UserService);
    const added = await userService.usersRepository.add(
      Object.assign(new User(), {
        name: 'Kerry',
      }),
    );
    expect(added.name).toStrictEqual('Kerry');

    const get = await userService.usersRepository.getById(added._id);
    expect(get.name).toStrictEqual('Kerry');
    expect(get._id).toStrictEqual(added._id);
  });
});
