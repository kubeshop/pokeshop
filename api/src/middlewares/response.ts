import { createSpan, getParentSpan, runWithSpan } from "@pokemon/telemetry/tracing";

const jsonResponse = (statusCode: Number = 200) => {
    return async function jsonResponse (ctx, next) {
        const parentSpan = await getParentSpan();
        const span = await createSpan('middleware jsonResponse', parentSpan);
        try {
            const response = await runWithSpan(span, async () => await next());
            ctx.status = statusCode;
            ctx.body = response;
        } catch (ex) {
            span.recordException(ex);
            ctx.status = 500;
            ctx.body = {};
        } finally {
            span.end();
        }
    }
}

export { jsonResponse }