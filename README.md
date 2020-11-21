<h1 align="center">nest-monk</h1>
<div align="center">
  <img src="https://beermoneydev-assets.s3.amazonaws.com/nest-monk-logo.png" />
</div>
<br />
<div align="center">
  <strong>A thin wrapping layer around the <a href="https://automattic.github.io/monk/" target="_blank">monk</a> package for clean <a href="https://github.com/nestjs">NestJS</a> dependency injection.</strong>
</div>
<br />
<div align="center">
<a href="https://www.npmjs.com/package/nest-monk"><img src="https://img.shields.io/npm/v/nest-monk.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/package/nest-monk"><img src="https://img.shields.io/npm/l/nest-monk.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/package/nest-monk"><img src="https://img.shields.io/npm/dm/nest-monk.svg" alt="NPM Downloads" /></a>
</div>

# Features

* A simple dependency injection model with `MonkModule.forRoot()`, `MonkModule.forRootAsync()` and `MonkModule.forFeatures()`.
* `@InjectCollection(MyModel)` decorator for injecting Monk collection instances.
* Simple auto-generated CRUD repositories for models, injectable by `@InjectRepository(MyModel)`.
* Built-in TypeScript class transformations using the <a href="https://github.com/typestack/class-transformer">class-transformer</a> package and monk middleware.

# How To Use

## Install

```bash
npm install --save nest-monk monk
```

## Importing

### MonkModule.forRoot()

`MonkModule.forRoot()` is the simplest way to import the Monk dependencies and uses static values.

```ts
// app.module.ts
@Module({
  imports: [
    MonkModule.forRoot({
      database: 'mongodb://127.0.0.1:27017',
      options: {
        ssl: true,
      }
    }),
  ],
})
class AppRootModule {}
```

#### database

`database` is the connection string to the Mongo server and database.

#### options

`options` are the monk options to be passed into the instantiation. See <a href="https://automattic.github.io/monk/docs/manager/">monk Manager documentation</a> for more details.

### MonkModule.forRootAsync()

`MonkModule.forRootAsync()` allows for a `FactoryProvider` or `ValueProvider` dependency declaration to import your module. Note that `ExistingProvider` and `ClassProvider` are not yet supported.

```ts
// app.module.ts
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
  ],
})
class AppRootModule {}
```

## Registering Model Collections

### Models

Models are the shape of the data in your collection. If you would like to let `nest-monk` use simple defaults, you simply can pass a class to the collection registration (see below), but the `@Model()` decorator can be used to provide optional overrides to collection settings.

#### Without decorator
```ts
// user.model.ts

// default collection name is "users". no indexes will be configured.
class User {
  _id: string;
  name: string;
}
```

#### With decorator
```ts
// user.model.ts

@Model({
  collectionName: 'app_users',
  collectionOptions: o => o.createIndex('name', { unique: true }),
})
class User {
  _id: string;
  name: string;
}
```

##### collectionName

This is the name of the collection stored in the Mongo database.

##### collectionOptions

This will be executed against the collection. This is where modifications to the collection should go, i.e. creation of indexes.

### forRoot registration

Models can be registered at the root level in the `collections` array by passing the type symbol to the array. Note, if you register models here, do not register them in feature modules as unexpected behavior is likely.

```ts
// app.module.ts

@Module({
  imports: [
    MonkModule.forRoot({
      database: 'mongodb://127.0.0.1:27017',
      collections: [User],
    }),
  ],
})
class AppRootModule {}
```

### forFeatures registration

Models can be registered at submodule levels using the `MonkModule.forFeatures()` method. Similar to the root-level registration, simply pass an array of Model types. 

```ts
// user.model.ts
@Model()
class User {
  _id: string;
  name: string;
}

// user.module.ts
@Module({
  imports: [MonkModule.forFeatures([User])],
})
class UserModule {}
```

## Collection injection

Collections can be injected using the `@InjectCollection()` decorator. Collections are a <a href="https://automattic.github.io/monk/docs/collection/">monk construct</a> that `nest-monk` exposes through dependency injection.

```ts
@Injectable()
class UserService {
  constructor(
    @InjectCollection(User) readonly usersCollection: ICollection<User>,
  ) {}

  async getAll() {
    return await this.usersCollection.find();
  }
}
```

## Repository injection

Repositories can be injected using the `@InjectRepository()` decorator. The repositories are created by `nest-monk` and are a simple CRUD interface handy for quickly creating REST controllers.

* `getById(id: string)` - Retrieves data by the default mongo `_id` property.
* `list(query: string | Object)` - Retrieves data given the mongo query. Leave empty to retrieve all.
* `add(model: T)` - Saves the given model to the database. 
* `delete(id: string)` - Deletes the given data from the database.
* `edit(id: string, model: T, setProperties?: (keyof T)[])` - Updates the data for the given ID. Use `setProperties` to define specific properties to set, or leave undefined to set all properties.

```ts
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
```

# Stay In Touch

* Author - [Kerry Ritter](https://twitter.com/kerryritter) and BeerMoneyDev

## License

nest-monk is MIT licensed.