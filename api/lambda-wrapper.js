/* eslint-disable @typescript-eslint/no-var-requires */
const {SimpleSpanProcessor, ConsoleSpanExporter} = require("@opentelemetry/sdk-trace-base");
const {NodeTracerProvider} = require('@opentelemetry/sdk-trace-node');
const {AwsLambdaInstrumentation} = require('@opentelemetry/instrumentation-aws-lambda');
const {registerInstrumentations} = require('@opentelemetry/instrumentation');
const {getNodeAutoInstrumentations} = require("@opentelemetry/auto-instrumentations-node");
const {OTLPTraceExporter} = require('@opentelemetry/exporter-trace-otlp-grpc');
const { setupSequelize } = require('./src/utils/db');

void setupSequelize()

const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()))

const exporter = new OTLPTraceExporter({
    url: 'http://52.15.144.221:4317',
});
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

provider.register();
registerInstrumentations({
    instrumentations: [
        getNodeAutoInstrumentations(),
        new AwsLambdaInstrumentation({
            disableAwsContextPropagation: true
        })
    ],
});

['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => provider.shutdown().catch(console.error));
});