import Koa from 'koa';
import { snakeCase } from 'lodash';
import { context, propagation, SpanStatusCode } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { createSpanFromContext, runWithSpan } from '@pokemon/telemetry/tracing';
import { CustomTags } from '../constants/Tags';

const instrumentRoute = () => {
  return async (ctx: Koa.BaseContext, next) => {
    const { method, ip, url: route, headers, body, host, protocol } = ctx;

    const parentContext = propagation.extract(context.active(), headers);
    const span = await createSpanFromContext(`${method} ${route}`, parentContext);

    try {
      return await runWithSpan(span, async () => next(ctx));
    } catch (ex) {
      span.recordException(ex);
      span.setStatus({ code: SpanStatusCode.ERROR });
      ctx.status = 400;
    } finally {
      Object.entries(headers).forEach(([key, value]) => {
        span.setAttribute(`${CustomTags.HTTP_REQUEST_HEADER}.${snakeCase(key)}`, JSON.stringify([value]));
      });

      span.setAttributes({
        [SemanticAttributes.HTTP_STATUS_CODE]: ctx.status,
        [CustomTags.HTTP_RESPONSE_BODY]: JSON.stringify(ctx.body),
        [CustomTags.HTTP_REQUEST_BODY]: JSON.stringify(body),
        [SemanticAttributes.HTTP_ROUTE]: route,
        [SemanticAttributes.HTTP_CLIENT_IP]: ip,
        [SemanticAttributes.HTTP_METHOD]: method,
        [SemanticAttributes.HTTP_HOST]: host,
        [SemanticAttributes.HTTP_SCHEME]: protocol,
        [SemanticAttributes.HTTP_USER_AGENT]: headers['user-agent'] || '',
      });

      span.end();
    }
  };
};

export { instrumentRoute };
