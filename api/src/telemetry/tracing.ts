import * as opentelemetry from '@opentelemetry/api';
import { SpanStatusCode } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { AmqplibInstrumentation } from '@opentelemetry/instrumentation-amqplib';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { Resource } from '@opentelemetry/resources';
import { api, NodeSDK } from '@opentelemetry/sdk-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import * as dotenv from 'dotenv';

// Make sure all env variables are available in process.env
dotenv.config();

api.propagation.setGlobalPropagator(new B3Propagator());

const { COLLECTOR_ENDPOINT = '', SERVICE_NAME = 'pokeshop' } = process.env;

let globalTracer: opentelemetry.Tracer | null = null;

async function createTracer(): Promise<opentelemetry.Tracer> {
  const collectorExporter = new OTLPTraceExporter({
    url: COLLECTOR_ENDPOINT,
  });

  const sdk = new NodeSDK({
    traceExporter: collectorExporter,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instrumentations: [new IORedisInstrumentation(), new PgInstrumentation(), new AmqplibInstrumentation() as any],
  });

  // const spanProcessor = new BatchSpanProcessor(collectorExporter);
  // sdk.configureTracerProvider({}, spanProcessor);
  sdk.addResource(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
    })
  );

  await sdk.start();
  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(
        () => console.log('SDK shut down successfully'),
        err => console.log('Error shutting down SDK', err)
      )
      .finally(() => process.exit(0));
  });

  globalTracer = opentelemetry.trace.getTracer(SERVICE_NAME);

  return globalTracer;
}

async function getTracer(): Promise<opentelemetry.Tracer> {
  if (globalTracer) {
    return globalTracer;
  }

  return createTracer();
}

async function getParentSpan(): Promise<opentelemetry.Span | undefined> {
  const parentSpan = opentelemetry.trace.getSpan(opentelemetry.context.active());
  if (!parentSpan) {
    return undefined;
  }

  return parentSpan;
}

async function createSpan(
  name: string,
  parentSpan?: opentelemetry.Span | undefined,
  options?: opentelemetry.SpanOptions | undefined
): Promise<opentelemetry.Span> {
  const tracer = await getTracer();
  if (parentSpan) {
    const context = opentelemetry.trace.setSpan(opentelemetry.context.active(), parentSpan);

    return createSpanFromContext(name, context, options);
  }

  return tracer.startSpan(name);
}

async function createSpanFromContext(
  name: string,
  ctx: opentelemetry.Context,
  options?: opentelemetry.SpanOptions | undefined
): Promise<opentelemetry.Span> {
  const tracer = await getTracer();
  if (!ctx) {
    return tracer.startSpan(name, options, opentelemetry.context.active());
  }

  return tracer.startSpan(name, options, ctx);
}

async function runWithSpan<T>(parentSpan: opentelemetry.Span, fn: () => Promise<T>): Promise<T> {
  const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), parentSpan);

  try {
    return await opentelemetry.context.with(ctx, fn);
  } catch (ex) {
    parentSpan.recordException(ex);
    parentSpan.setStatus({ code: SpanStatusCode.ERROR });
    throw ex;
  }
}

export { getTracer, getParentSpan, createSpan, createSpanFromContext, runWithSpan };
