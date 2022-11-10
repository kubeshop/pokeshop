import * as opentelemetry from '@opentelemetry/api';

export const createSpanFromContext =  async (
  name: string,
  ctx: opentelemetry.Context,
  options?: opentelemetry.SpanOptions | undefined
): Promise<opentelemetry.Span> {
  const tracer = await opentelemetry.trace.getTracer('pokeshop-api');

  if (!ctx) {
    return tracer.startSpan(name, options, opentelemetry.context.active());
  }

  return tracer.startSpan(name, options, ctx);
}
