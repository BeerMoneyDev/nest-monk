import { Module, DynamicModule, FactoryProvider } from '@nestjs/common';
import monk, { ICollection } from 'monk';
import * as snakeCase from 'lodash.snakecase';
import {
  MONK_DATABASE_TOKEN,
  MONK_OPTIONS_TOKEN,
  createMonkCollectionToken,
  createMonkRepositoryToken,
} from './tokens';
import {
  MonkOptions,
  AsyncProvider,
  ImportableFactoryProvider,
  ModelType,
} from './types';
import { Repository } from './repository.service';
import { ModelRegistrations } from './decorators';
import { classTransformerMiddlewareFactory } from './class-transformer.middleware';

export class FakeMonk {
  constructor(readonly database: any, readonly options: any) {}
}

export class FakeCollection {
  constructor(readonly data: any) {}
}

@Module({})
export class MonkModule {
  static forRoot(moduleOptions: {
    database: string | Array<string>;
    collections?: Array<ModelType<any>>;
    options?: MonkOptions;
  }): DynamicModule {
    return this.forRootAsync({
      database: {
        useValue: moduleOptions.database,
      },
      collections: moduleOptions?.collections?.length
        ? moduleOptions.collections
        : null,
      options: moduleOptions.options
        ? { useValue: moduleOptions.options }
        : null,
    });
  }

  static forRootAsync(moduleOptions: {
    database: AsyncProvider<
      string | Array<string> | Promise<string> | Promise<Array<string>>
    >;
    collections?: Array<ModelType<any>>;
    options?: AsyncProvider<MonkOptions>;
  }): DynamicModule {
    const module: DynamicModule = {
      global: true,
      module: MonkModule,
      imports: [],
      providers: [],
      exports: [],
    };

    const addAsyncProvider = <T>(
      provide: string,
      defaultValue: T,
      asyncProvider: AsyncProvider<T>,
      exportable: boolean,
    ) => {
      if (!asyncProvider) {
        module.providers.push({
          provide,
          useValue: defaultValue,
        });
      } else {
        const imports = (asyncProvider as ImportableFactoryProvider<
          MonkOptions
        >).imports;
        if (imports?.length) {
          imports.forEach(i => module.imports.push(i));
        }
        delete (asyncProvider as ImportableFactoryProvider<MonkOptions>)
          .imports;

        module.providers.push({
          ...asyncProvider,
          provide,
        });
      }

      if (exportable) {
        module.exports.push(provide);
      }
    };

    addAsyncProvider(MONK_DATABASE_TOKEN, '', moduleOptions.database, true);
    addAsyncProvider(MONK_OPTIONS_TOKEN, {}, moduleOptions.options, true);

    this.createCollectionProviders(moduleOptions?.collections).forEach(cp => {
      module.providers.push(cp);
      module.exports.push(cp.provide);
    });

    this.createRepositoryProviders(moduleOptions?.collections).forEach(cp => {
      module.providers.push(cp);
      module.exports.push(cp.provide);
    });

    return module;
  }

  static forFeatures(collections?: Array<ModelType<any>>): DynamicModule {
    const module: DynamicModule = {
      module: MonkModule,
      imports: [],
      providers: [],
      exports: [],
    };

    this.createCollectionProviders(collections).forEach(cp => {
      module.providers.push(cp);
      module.exports.push(cp.provide);
    });

    this.createRepositoryProviders(collections).forEach(cp => {
      module.providers.push(cp);
      module.exports.push(cp.provide);
    });

    return module;
  }

  private static createRepositoryProviders = (
    collections?: Array<ModelType<any>>,
  ): FactoryProvider<ICollection<any>>[] => {
    return (collections ?? []).map(f => {
      return {
        provide: createMonkRepositoryToken(f),
        useFactory: (collection: ICollection<any>) => {
          return new Repository(collection) as any;
        },
        inject: [createMonkCollectionToken(f)],
      };
    });
  };

  private static createCollectionProviders = (
    collections?: Array<ModelType<any>>,
  ): FactoryProvider<Promise<ICollection<any>>>[] => {
    return (collections ?? []).map(f => {
      return {
        provide: createMonkCollectionToken(f),
        useFactory: async (database: string, options: MonkOptions) => {
          const modelOptions = ModelRegistrations.get(f);
          const collectionName = modelOptions?.collectionName?.length
            ? ModelRegistrations.get(f).collectionName
            : `${snakeCase(f.name)}s`;
          return await monk(database, options).then(db => {
            db.addMiddleware(classTransformerMiddlewareFactory(f));
            const collection = db.get(collectionName);
            if (collection) {
              modelOptions.collectionOptions?.(collection);
            }
            return collection;
          });
        },
        inject: [MONK_DATABASE_TOKEN, MONK_OPTIONS_TOKEN],
      };
    });
  };
}
