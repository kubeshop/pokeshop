import { createSpan, getParentSpan, runWithSpan } from "@pokemon/telemetry/tracing"

const instrumentRoute = () => {
    return async (ctx, next) => {
        const method = ctx.request.method;
        const route = ctx.request.url;
        const requestBody = ctx.body;
        const headers = ctx.request.headers;

        const parentSpan = await getParentSpan();
        const span = await createSpan(`${method} ${route}`, parentSpan);

        span.setAttribute('http.request.body', JSON.stringify(requestBody))
        span.setAttribute('http.request.headers', JSON.stringify(headers));

        const result = runWithSpan(span, async () => await next(ctx));

        span.setAttribute('http.response.body', JSON.stringify(ctx.body));
        span.setAttribute('http.status_code', ctx.status);

        span.end();

        return result;
    }
}

export { instrumentRoute };