import { context, propagation, SpanStatusCode } from "@opentelemetry/api";
import { createSpanFromContext, runWithSpan } from "@pokemon/telemetry/tracing"

const instrumentRoute = () => {
    return async (ctx, next) => {
        const method = ctx.request.method;
        const route = ctx.request.url;
        const requestBody = ctx.body;
        const headers = ctx.request.headers;

        const parentContext = propagation.extract(context.active(), headers);
        const span = await createSpanFromContext(`${method} ${route}`, parentContext);

        try {
            return await runWithSpan(span, async () => next(ctx));
        } catch (ex) {
            span.recordException(ex);
            span.setStatus({ code: SpanStatusCode.ERROR });
            ctx.status = 400;
        } finally {
            span.setAttribute('http.status_code', ctx.response.status);
            span.setAttribute('http.response.body', JSON.stringify(ctx.body));
            span.setAttribute('http.request.body', JSON.stringify(requestBody))
            span.setAttribute('http.request.headers', JSON.stringify(headers));

            span.end();
        }
    }
}

export { instrumentRoute };