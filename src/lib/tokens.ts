import { ModelType } from './types';

export const MONK_DATABASE_TOKEN = 'MONK_DATABASE';
export const MONK_OPTIONS_TOKEN = 'MONK_OPTIONS';

export function createMonkCollectionToken(type: ModelType<any>) {
  return `COLLECTION_${type.name}`.toLocaleUpperCase();
}

export function createMonkRepositoryToken(type: ModelType<any>) {
  return `REPOSITORY_${type.name}`.toLocaleUpperCase();
}
