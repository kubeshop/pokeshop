import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import * as opentelemetry from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import * as dotenv from 'dotenv';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

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
    instrumentations: [getNodeAutoInstrumentations()]
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

export { getTracer };
