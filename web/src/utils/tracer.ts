import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from '@opentelemetry/core';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { UserInteractionInstrumentation } from '@tracetest/instrumentation-user-interaction';
import loadConfig from './loadConfig';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';

const createTracer = async () => {
  const { SERVICE_NAME, HTTP_COLLECTOR_ENDPOINT } = await loadConfig();

  const provider = new WebTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME || 'pokeshop-demo-webapp',
    }),
  });

  provider.addSpanProcessor(
    new SimpleSpanProcessor(
      new OTLPTraceExporter({ url: HTTP_COLLECTOR_ENDPOINT || 'http://localhost:4318/v1/traces' })
    )
  );

  provider.register({
    contextManager: new ZoneContextManager(),
    propagator: new CompositePropagator({
      propagators: [new W3CBaggagePropagator(), new W3CTraceContextPropagator()],
    }),
  });

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      new UserInteractionInstrumentation(),
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-fetch': {
          propagateTraceHeaderCorsUrls: /.*/,
          clearTimingResources: true,
        },
        '@opentelemetry/instrumentation-user-interaction': {
          enabled: false,
        },
      }),
    ],
  });
};

createTracer();
