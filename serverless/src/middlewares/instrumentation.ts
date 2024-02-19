import { PromiseHandler } from '@lambda-middleware/utils';
import { snakeCase } from 'lodash';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { CustomTags } from '../constants/tags';
import { createSpan, getParentSpan, runWithSpan } from '../telemetry/tracing';

const instrumentation =
  () =>
  (
    handler: PromiseHandler<APIGatewayProxyEvent, APIGatewayProxyResult>
  ): PromiseHandler<APIGatewayProxyEvent, APIGatewayProxyResult> =>
  async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const {
      headers,
      body,
      requestContext: { routeKey },
    } = event;

    const parentSpan = await getParentSpan();
    const span = await createSpan(`${routeKey}`, parentSpan, { kind: SpanKind.SERVER });

    return runWithSpan(span, async () => {
      try {
        return handler(event, context);
      } catch (error) {
        span.recordException(error);
        span.setStatus({ code: SpanStatusCode.ERROR });

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
      } finally {
        Object.entries(headers).forEach(([key, value]) => {
          span.setAttribute(`${CustomTags.HTTP_REQUEST_HEADER}.${snakeCase(key)}`, JSON.stringify([value]));
        });

        span.setAttributes({
          [CustomTags.HTTP_REQUEST_BODY]: JSON.stringify(body),
          [SemanticAttributes.HTTP_USER_AGENT]: headers['user-agent'] || '',
        });

        span.end();
      }
    });
  };

export default instrumentation;
