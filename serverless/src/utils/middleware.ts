import { composeHandler } from '@lambda-middleware/compose';
import { PromiseHandler } from '@lambda-middleware/utils';
import { cors } from '@lambda-middleware/cors';
import { jsonSerializer } from '@lambda-middleware/json-serializer';
import errorHandler from './errorHandler';
import instrumentation from './instrumentation';

export const composeMiddleware = (handler: PromiseHandler) =>
  composeHandler(
    instrumentation(),
    errorHandler(),
    cors({
      allowedHeaders: [],
      cacheControl: 'max-age: 300',

      allowCredentials: true,
      maxAge: 300,
      allowedMethods: ['GET', 'HEAD', 'PATCH', 'POST', 'DELETE'],
      optionsSuccessStatus: 204,
      allowedOrigins: ['*'],
      preflightContinue: false,
    }),
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
