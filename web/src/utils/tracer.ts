import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import loadConfig from './loadConfig';

const createTracer = async () => {
  const { ZIPKIN_URL = 'http://localhost:9411' } = await loadConfig();

  const provider = new WebTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'pokeshop-ui',
    }),
  });

  provider.addSpanProcessor(
    new BatchSpanProcessor(
      new ZipkinExporter({
        headers: {
          'Content-Type': 'application/json',
        },
        serviceName: 'pokeshop-ui',
        url: `${ZIPKIN_URL}/api/v2/spans`,
      })
    )
  );

  provider.register({
    contextManager: new ZoneContextManager(),
    propagator: new B3Propagator(),
  });

  registerInstrumentations({
    instrumentations: [
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-fetch': {
          propagateTraceHeaderCorsUrls: /.*/,
          clearTimingResources: true,
        },
      }),
    ],
  });
};

createTracer();
