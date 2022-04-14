import { createSpan, getParentSpan, runWithSpan } from "@pokemon/telemetry/tracing";

export abstract class InstrumentedComponent {

    protected async instrumentMethod<T>(spanName: string, innerMethod: () => Promise<T>): Promise<T> {
        const parentSpan = await getParentSpan();
        const span = await createSpan(spanName, parentSpan);
        try {
            return await runWithSpan(span, async () => {
                const result = await innerMethod()
                return result;
            });
        } catch (ex) {
            span.recordException(ex);
            throw ex;
        } finally {
            span.end();
        }
    }
}