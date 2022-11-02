/* eslint-disable @typescript-eslint/no-var-requires */
const {SimpleSpanProcessor, ConsoleSpanExporter} = require("@opentelemetry/sdk-trace-base");
const {NodeTracerProvider} = require('@opentelemetry/sdk-trace-node');
const {AwsLambdaInstrumentation} = require('@opentelemetry/instrumentation-aws-lambda');
const {registerInstrumentations} = require('@opentelemetry/instrumentation');
const {getNodeAutoInstrumentations} = require("@opentelemetry/auto-instrumentations-node");
const {OTLPTraceExporter} = require('@opentelemetry/exporter-trace-otlp-grpc');


const collectorOptions = {
    url: 'http://13.59.115.190:4317',
};


const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()))

const exporter = new OTLPTraceExporter(collectorOptions);
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