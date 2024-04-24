import Koa from 'koa';
import { snakeCase } from 'lodash';
import { context, propagation, SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { createSpanFromContext, runWithSpan } from '@pokemon/telemetry/tracing';
import { CustomTags } from '../constants/Tags';
import { handleUnaryCall, sendUnaryData, UntypedServiceImplementation } from '@grpc/grpc-js';

const instrumentRoute = () => {
  return async (ctx: Koa.BaseContext, next) => {
    const { method, ip, url: route, headers, body, host, protocol, query } = ctx;
    const isFixed = query.isFixed === 'true';

    const parentContext = propagation.extract(context.active(), headers);
    console.log('@@>> Requesting method', method, route, headers);
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
        [SemanticAttributes.HTTP_USER_AGENT]: headers['user-agent'] || '',

        ...(isFixed
          ? {
              [SemanticAttributes.NET_HOST_NAME]: host,
              [SemanticAttributes.HTTP_TARGET]: route,
              [SemanticAttributes.HTTP_SCHEME]: 'https',
            }
          : {
              [SemanticAttributes.HTTP_SCHEME]: protocol,
            }),
      });

      span.end();
    }
  };
};

type THandler = handleUnaryCall<unknown, unknown>;

const instrumentRpcMethod = (name: string, method: THandler, serverName: string): THandler => {
  return async (call, finalCallback) => {
    const [, serviceName, methodName] = call.getPath().split('/');
    const parentContext = propagation.extract(context.active(), call.metadata.getMap());
    const span = await createSpanFromContext(`${serviceName}/${methodName}`, parentContext, { kind: SpanKind.SERVER });

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
      const [hostname, port] = call.getPeer().split(':');
      const isFixed = !!(call?.request as Record<string, string>).isFixed;

      span.setAttributes({
        [CustomTags.RPC_REQUEST_BODY]: JSON.stringify(call.request),
        [SemanticAttributes.RPC_SYSTEM]: 'grpc',
        [SemanticAttributes.RPC_SERVICE]: serviceName,
        [SemanticAttributes.RPC_METHOD]: methodName,
        ...(isFixed
          ? {
              [SemanticAttributes.NET_HOST_NAME]: serverName,
              [SemanticAttributes.NET_PEER_NAME]: hostname,
              [SemanticAttributes.NET_PEER_PORT]: port,
            }
          : {}),
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
