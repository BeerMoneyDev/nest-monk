import { DynamicModule, ValueProvider, FactoryProvider } from '@nestjs/common';
import { ICollection } from 'monk';

export interface ModelOptions<T> {
  collectionName?: string;
  collectionOptions?: (collection: ICollection<T>) => void;
}

export interface ModelType<T> extends Function, ModelOptions<T> {
  new (...args: any[]): T;
}

export interface ImportableFactoryProvider<T>
  extends Omit<FactoryProvider<T>, 'provide'>,
    Pick<DynamicModule, 'imports'> {}

export type AsyncProvider<T> =
  | ImportableFactoryProvider<T>
  | Omit<ValueProvider<T>, 'provide'>;

export interface MonkOptions {
  collectionOptions?: Object;
  poolSize?: number;
  ssl?: boolean;
  sslValidate?: boolean;
  sslCA?: Array<string | Buffer>;
  sslCert?: string | Buffer;
  sslKey?: string | Buffer;
  sslPass?: string | Buffer;
  autoReconnect?: boolean;
  noDelay?: boolean;
  keepAlive?: number;
  connectTimeoutMS?: number;
  socketTimeoutMS?: number;
  reconnectTries?: number;
  reconnectInterval?: number;
  ha?: boolean;
  haInterval?: number;
  replicaSet?: string;
  secondaryAcceptableLatencyMS?: number;
  acceptableLatencyMS?: number;
  connectWithNoPrimary?: boolean;
  authSource?: string;
  w?: string | number;
  wtimeout?: number;
  j?: boolean;
  forceServerObjectId?: boolean;
  serializeFunctions?: boolean;
  ignoreUndefined?: boolean;
  raw?: boolean;
  promoteLongs?: boolean;
  bufferMaxEntries?: number;
  readPreference?: Object | null;
  pkFactory?: Object | null;
  promiseLibrary?: Object | null;
  readConcern?: Object | null;
}
