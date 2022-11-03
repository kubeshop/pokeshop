import { composeHandler } from '@lambda-middleware/compose';
import { errorHandler } from '@lambda-middleware/http-error-handler';
import { JSONObject } from '@lambda-middleware/json-serializer/lib/types/JSONObject';

import { PromiseHandler } from '@lambda-middleware/utils';
import { APIGatewayEvent, Context } from 'aws-lambda';

import { get as getHandler } from './src/handlers/get.handler';


export const tracetestJsonSerializer = () => (
  handler: PromiseHandler<APIGatewayEvent, JSONObject | undefined>
) => async (
  event: APIGatewayEvent,
  context: Context
): Promise<unknown> => {
  return handler({...event, body: typeof event?.body === "string" ? JSON.parse(event?.body): event?.body}, context);
};


export const composeMiddleware = (handler: PromiseHandler) =>
  composeHandler(
    tracetestJsonSerializer(),
    handler,
  );

export const composeHandlers = (handlerMap: Record<string, PromiseHandler>) =>
  Object.entries(handlerMap).reduce<Record<string, PromiseHandler>>(
    (acc, [handlerName, handler]) => ({
      ...acc,
      [handlerName]: composeMiddleware(handler),
    }),
    {},
  );

export const handlers = composeHandlers({ get: getHandler });

module.exports.get = getHandler;