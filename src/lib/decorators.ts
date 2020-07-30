import { Inject, Type } from '@nestjs/common';
import { createMonkCollectionToken, createMonkRepositoryToken } from './tokens';
import { ModelType, ModelOptions } from './types';

export class ModelRegistrations {
  static readonly map = new Map<ModelType<any>, ModelOptions<any>>();

  static add<T>(type: ModelType<T>, options?: ModelOptions<T>) {
    return ModelRegistrations.map.set(type, options);
  }

  static get<T>(type: ModelType<T>) {
    return ModelRegistrations.map.get(type);
  }
}

export function InjectCollection<T>(type: ModelType<T>) {
  return Inject(createMonkCollectionToken(type));
}

export function InjectRepository<T>(type: ModelType<T>) {
  return Inject(createMonkRepositoryToken(type));
}

export function Model<T>(options?: ModelOptions<T>) {
  return function(target: ModelType<T>) {
    ModelRegistrations.add(target, options);
  };
}
