import { MongoMemoryServer } from 'mongodb-memory-server';
import { Module, Injectable, Controller, Get } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ICollection } from 'monk';
import {
  MonkModule,
  InjectCollection,
  InjectRepository,
  Model,
  Repository,
} from '../src';

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

@Controller()
class UserController {
  constructor(
    @InjectRepository(User) readonly usersRepository: Repository<User>,
  ) {}

  @Get(':id')
  async getById(id: string) {
    return await this.usersRepository.getById(id);
  }
}
/* END USERS */

@Module({
  imports: [
    MonkModule.forRoot({
      database: 'mongodb://127.0.0.1:27017',
      options: {
        ssl: true,
      },
    }),
  ],
  providers: [UserService],
  exports: [UserService],
})
class AppRootModule {}

describe('MonkModule forRoot', () => {
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
