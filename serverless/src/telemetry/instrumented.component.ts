import { Span, SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { createSpan, getParentSpan, runWithSpan } from '../telemetry/tracing';

export abstract class InstrumentedComponent {
  protected async instrumentMethod<T>(
    spanName: string,
    spanKind: SpanKind | undefined,
    innerMethod: (span?: Span) => Promise<T>
  ): Promise<T> {
    const parentSpan = await getParentSpan();
    const span = await createSpan(spanName, parentSpan, { kind: spanKind || SpanKind.INTERNAL });
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
