import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import * as opentelemetry from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import * as dotenv from 'dotenv';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { KoaInstrumentation } from '@opentelemetry/instrumentation-koa';
import { AmqplibInstrumentation } from '@opentelemetry/instrumentation-amqplib';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg'
import {} from '@opentelemetry/api'

// Make sure all env variables are available in process.env
dotenv.config();

const { JAEGER_HOST = '', JAEGER_PORT = '6832', SERVICE_NAME = 'pokeshop' } = process.env;

let globalTracer: opentelemetry.Tracer | null = null;

async function createTracer(): Promise<opentelemetry.Tracer> {
  const jaegerExporter = new JaegerExporter({ 
    host: JAEGER_HOST,
    port: +JAEGER_PORT,
  });

  const spanProcessor = new SimpleSpanProcessor(jaegerExporter);
  const sdk = new NodeSDK({
    traceExporter: jaegerExporter,
    instrumentations: [
      new IORedisInstrumentation(),
      new PgInstrumentation(),
    ]
  });

  sdk.configureTracerProvider({}, spanProcessor);
  sdk.addResource(new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME
  }))

  await sdk.start();
  process.on("SIGTERM", () => {
    sdk
      .shutdown()
      .then(
        () => console.log("SDK shut down successfully"),
        (err) => console.log("Error shutting down SDK", err)
      )
      .finally(() => process.exit(0));
  });
  
  const tracer = opentelemetry.trace.getTracer(SERVICE_NAME);

  globalTracer = tracer;

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
  let span: opentelemetry.Span | undefined;
  if (parentSpan) {
    const ctx = opentelemetry.trace.setSpan(
      opentelemetry.context.active(),
      parentSpan
    );

    span = tracer.startSpan(name, options, ctx);
  }

  span = tracer.startSpan(name)

  return span;
}

async function runWithSpan<T>(parentSpan: opentelemetry.Span, fn: () => Promise<T>): Promise<T> {
  const ctx = opentelemetry.trace.setSpan(
    opentelemetry.context.active(),
    parentSpan
  );

  return await opentelemetry.context.with(ctx, fn);
}

export { getTracer, getParentSpan, createSpan, runWithSpan };
