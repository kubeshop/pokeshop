import { PromiseHandler } from '@lambda-middleware/utils';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { setupSequelize } from '../utils/db';

const isDBReady = setupSequelize();

const db =
  () =>
  (
    handler: PromiseHandler<APIGatewayProxyEvent, APIGatewayProxyResult>
  ): PromiseHandler<APIGatewayProxyEvent, APIGatewayProxyResult> =>
  async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    await isDBReady;
    return handler(event, context);
  };

export default db;
