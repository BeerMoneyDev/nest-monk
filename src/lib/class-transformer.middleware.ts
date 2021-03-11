import { Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { ModelType } from './types';

export function classTransformerMiddlewareFactory<T>(type: ModelType<T>) {
  return context => next => (args, method) => {
    return next(args, method).then(res => {
      if (res && method !== 'remove') {
        try {
          res = plainToClass(type, res);
        } catch (ex) {
          res = null;
          const error = ex as Error;
          new Logger('classTransformerMiddlewareFactory').error(
            error.message,
            error.stack,
          );
        }
      }
      return res;
    });
  };
}
