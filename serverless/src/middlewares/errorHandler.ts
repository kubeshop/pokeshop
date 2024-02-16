import { PromiseHandler } from '@lambda-middleware/utils';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import debugFactory, { IDebugger } from 'debug';

const logger: IDebugger = debugFactory('@lambda-middleware/error-handler');

const errorHandler =
  () =>
  (
    handler: PromiseHandler<APIGatewayProxyEvent, APIGatewayProxyResult>
  ): PromiseHandler<APIGatewayProxyEvent, APIGatewayProxyResult> =>
  async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    try {
      return await handler(event, context);
    } catch (error) {
      console.log('[❌ - ERROR]', error);
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

export default errorHandler;
