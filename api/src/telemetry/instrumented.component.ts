import { SpanStatusCode, Span } from '@opentelemetry/api';
import { createSpan, getParentSpan, runWithSpan } from '@pokemon/telemetry/tracing';

export abstract class InstrumentedComponent {
  protected async instrumentMethod<T>(spanName: string, innerMethod: (span?: Span) => Promise<T>): Promise<T> {
    const parentSpan = await getParentSpan();
    const span = await createSpan(spanName, parentSpan);
    try {
      return await runWithSpan(span, () => innerMethod(span));
    } catch (ex) {
      span.recordException(ex);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw ex;
    } finally {
      span.end();
    }
  }
}
