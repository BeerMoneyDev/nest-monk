import { plainToClass } from 'class-transformer';
import { ModelType } from './types';

export function classTransformerMiddlewareFactory<T>(type: ModelType<T>) {
  return context => next => (args, method) => {
    return next(args, method).then(res => {
      if (res) {
        res = plainToClass(type, res);
      }
      return res;
    });
  };
}
