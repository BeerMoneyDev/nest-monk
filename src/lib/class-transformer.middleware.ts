import { Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { ModelType } from './types';

const logger = new Logger('classTransformerMiddlewareFactory');

export function classTransformerMiddlewareFactory<T>(type: ModelType<T>) {
  return context => next => (args, method) => {
    return next(args, method).then(res => {
      if (res && method !== 'remove') {
        try {
          res = plainToClass(type, res);
        } catch (ex) {
          res = null;
          const error = ex as Error;
          logger.error(ex.message, ex.stack);
        }
      }
      return res;
    });
  };
}
