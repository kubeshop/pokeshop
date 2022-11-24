const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { PrismaInstrumentation } = require('@prisma/instrumentation');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { B3Propagator, B3InjectEncoding } = require('@opentelemetry/propagator-b3');
const api = require('@opentelemetry/api');

api.propagation.setGlobalPropagator(new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER }));

const collectorOptions = {
  url: process.env.COLLECTOR_ENDPOINT,
};

const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'pokeshop-api',
  }),
});

const exporter = new OTLPTraceExporter(collectorOptions);
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

registerInstrumentations({
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-aws-lambda': {
        disableAwsContextPropagation: true,
      },
    }),
    new PrismaInstrumentation(),
  ],
});

provider.register();

['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => provider.shutdown().catch(console.error));
});
