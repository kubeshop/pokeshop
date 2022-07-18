import Koa from 'koa';
import { snakeCase } from 'lodash';
import { context, propagation, SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { createSpanFromContext, runWithSpan } from '@pokemon/telemetry/tracing';
import { CustomTags } from '../constants/Tags';
import { handleUnaryCall, sendUnaryData, UntypedServiceImplementation } from '@grpc/grpc-js';

const instrumentRoute = () => {
  return async (ctx: Koa.BaseContext, next) => {
    const { method, ip, url: route, headers, body, host, protocol } = ctx;

    const parentContext = propagation.extract(context.active(), headers);
    const span = await createSpanFromContext(`${method} ${route}`, parentContext, { kind: SpanKind.SERVER });

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

type THandler = handleUnaryCall<unknown, unknown>;

const instrumentRpcMethod = (name: string, method: THandler, serverName: string): THandler => {
  return async (call, finalCallback) => {
    const parentContext = propagation.extract(context.active(), call.metadata.getMap());
    const span = await createSpanFromContext(name, parentContext, { kind: SpanKind.SERVER });

    const callback: sendUnaryData<unknown> = (error, response) => {
      span.setAttributes({
        [SemanticAttributes.RPC_GRPC_STATUS_CODE]: error?.code || 0,
        [CustomTags.RPC_RESPONSE_BODY]: JSON.stringify(response),
      });

      finalCallback(error, response);
    };

    try {
      return await runWithSpan(span, async () => method(call, callback));
    } catch (ex) {
      span.recordException(ex);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw ex;
    } finally {
      span.setAttributes({
        [SemanticAttributes.RPC_SYSTEM]: 'grpc',
        [SemanticAttributes.RPC_SERVICE]: `${serverName}.${name}`,
        [SemanticAttributes.RPC_METHOD]: name,
        [CustomTags.RPC_REQUEST_BODY]: JSON.stringify(call.request),
      });

      span.end();
    }
  };
};

const instrumentRpcServer = <T extends UntypedServiceImplementation>(
  server: UntypedServiceImplementation,
  serverName: string
): T => {
  return Object.entries(server).reduce<T>(
    (acc, [key, value]) => ({
      ...acc,
      [key]: instrumentRpcMethod(key, value as THandler, serverName),
    }),
    {} as T
  );
};

export { instrumentRoute, instrumentRpcServer };
