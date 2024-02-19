import * as opentelemetry from '@opentelemetry/api';
import * as dotenv from 'dotenv';
import { SpanStatusCode } from '@opentelemetry/api';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { AwsLambdaInstrumentation } from '@opentelemetry/instrumentation-aws-lambda';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

// Make sure all env variables are available in process.env
dotenv.config();

const { COLLECTOR_ENDPOINT = '', SERVICE_NAME = 'pokeshop' } = process.env;

let globalTracer: opentelemetry.Tracer | null = null;

async function createTracer(): Promise<opentelemetry.Tracer> {
  const provider = new NodeTracerProvider();

  const spanProcessor = new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: COLLECTOR_ENDPOINT,
    })
  );

  provider.addSpanProcessor(spanProcessor);
  provider.register();

  registerInstrumentations({
    instrumentations: [
      new AwsLambdaInstrumentation({
        disableAwsContextPropagation: true,
      }),
    ],
  });

  const tracer = provider.getTracer(SERVICE_NAME);

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
