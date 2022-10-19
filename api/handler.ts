import { composeHandler } from '@lambda-middleware/compose';
import { cors } from '@lambda-middleware/cors';
import { jsonSerializer } from '@lambda-middleware/json-serializer';
import { JSONObject } from '@lambda-middleware/json-serializer/lib/types/JSONObject';
import { PromiseHandler } from '@lambda-middleware/utils';
import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import debugFactory, { IDebugger } from 'debug';
import {create as createHandler }from './src/handlers/create.handler';
import {featured as featuredHandler }from './src/handlers/featured.handler';
import {get as getHandler}from './src/handlers/get.handler';
import {importPokemon as importPokemonHandler }from './src/handlers/import.handler';
import {remove as removeHandler }from './src/handlers/remove.handler';
import {search as searchHandler }from './src/handlers/search.handler';
import {update as updateHandler }from './src/handlers/update.handler';

const logger: IDebugger = debugFactory('@lambda-middleware/error-handler');

export const tracetestJsonSerializer = () => (
  handler: PromiseHandler<APIGatewayEvent, JSONObject | undefined>
) => async (
  event: APIGatewayEvent,
  context: Context
): Promise<unknown> => {
  logger("Tracetest Running handler");
  return handler({...event, body: typeof event?.body === "string" ? JSON.parse(event?.body): event?.body}, context);
};



const errorHandler =
  () =>
    (
      handler: PromiseHandler<APIGatewayProxyEvent, APIGatewayProxyResult>,
    ): PromiseHandler<APIGatewayProxyEvent, APIGatewayProxyResult> =>
      async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
        try {
          return await handler(event, context);
        } catch (error) {
          const { statusCode } = error as { statusCode?: number };
          if (typeof statusCode === 'number' && statusCode < 500) {
            logger(`Responding with full error as statusCode is ${statusCode}`);
            return {
              body: JSON.stringify(error),
              headers: {
                'Content-Type': 'application/json',
              },
              statusCode: statusCode,
            };
          }
          logger('Responding with internal server error');
          return {
            body: JSON.stringify({
              message: 'Internal server error',
              statusCode: 500,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            statusCode: 500,
          };
        }
      };

export const composeMiddleware = (handler: PromiseHandler) =>
  composeHandler(
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
    tracetestJsonSerializer(),
    handler,
  );

type THandlerMap = Record<string, PromiseHandler>;

export const composeHandlers = (handlerMap: THandlerMap) =>
  Object.entries(handlerMap).reduce<THandlerMap>(
    (acc, [handlerName, handler]) => ({
      ...acc,
      [handlerName]: composeMiddleware(handler),
    }),
    {},
  );

export const { create, get, update, remove, importPokemon, search, featured } = composeHandlers({
  create: createHandler(true),
  get: getHandler(true),
  update: updateHandler ,
  remove: removeHandler ,
  importPokemon: importPokemonHandler ,
  search: searchHandler ,
  featured: featuredHandler ,
});

