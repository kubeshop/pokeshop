import { context, propagation } from "@opentelemetry/api";
import { createSpan, createSpanFromContext, getParentSpan, runWithSpan } from "@pokemon/telemetry/tracing"

const instrumentRoute = () => {
    return async (ctx, next) => {
        const method = ctx.request.method;
        const route = ctx.request.url;
        const requestBody = ctx.body;
        const headers = ctx.request.headers;

        const parentContext = propagation.extract(context.active(), headers);
        const span = await createSpanFromContext(`${method} ${route}`, parentContext);

        
        const result = await runWithSpan(span, async () => await next(ctx));
        
        span.setAttribute('http.status_code', ctx.status);
        span.setAttribute('http.response.body', JSON.stringify(ctx.body));

        span.setAttribute('http.request.body', JSON.stringify(requestBody))
        span.setAttribute('http.request.headers', JSON.stringify(headers));

        span.end();

        return result;
    }
}

export { instrumentRoute };