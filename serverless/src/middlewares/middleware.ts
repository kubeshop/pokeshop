import { composeHandler } from '@lambda-middleware/compose';
import { PromiseHandler } from '@lambda-middleware/utils';
import { jsonSerializer } from '@lambda-middleware/json-serializer';
import errorHandler from './errorHandler';
import instrumentation from './instrumentation';
import db from './db';

export const composeMiddleware = (handler: PromiseHandler) =>
  composeHandler(
    errorHandler(),
    db(),
    instrumentation(),
    jsonSerializer(),
    handler
  );

type THandlerMap = Record<string, PromiseHandler>;

export const composeHandlers = (handlerMap: THandlerMap) =>
  Object.entries(handlerMap).reduce<THandlerMap>(
    (acc, [handlerName, handler]) => ({
      ...acc,
      [handlerName]: composeMiddleware(handler),
    }),
    {}
  );

export default composeHandlers;
