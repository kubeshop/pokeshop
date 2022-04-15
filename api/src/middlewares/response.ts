import { SpanStatusCode } from "@opentelemetry/api";
import { createSpan, getParentSpan, runWithSpan } from "@pokemon/telemetry/tracing";

const jsonResponse = (statusCode: Number = 200) => {
    return async function jsonResponse (ctx, next) {
        const parentSpan = await getParentSpan();
        const span = await createSpan('middleware jsonResponse', parentSpan);
        span.setAttribute('http.request.body', JSON.stringify(ctx.body));
        try {
            ctx.status = statusCode;
            const response = await runWithSpan(span, async () => await next(ctx));
            span.setAttribute('http.response.body', JSON.stringify(response));
            const status = ctx.status
            ctx.body = response;
            // This is needed because if ctx.body = null | undefined, ctx.status is updated to 204
            ctx.status = status
        } catch (ex) {
            span.recordException(ex);
            span.setStatus({ code: SpanStatusCode.ERROR });
            ctx.status = 500;
            ctx.body = {};
        } finally {
            span.end();
        }
    }
}

export { jsonResponse }