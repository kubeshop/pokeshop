import { SpanStatusCode } from '@opentelemetry/api';
import { createSpan, getParentSpan, runWithSpan } from '@pokemon/telemetry/tracing';
import { transformAndValidate } from 'class-transformer-validator';

const validate = (type) => {
    return async function validate(ctx, next) {
        const parentSpan = await getParentSpan();
        const span = await createSpan('validate request', parentSpan);

        const body = ctx.request.body;
        try {
            const validType = await runWithSpan(span, async () => await transformAndValidate(type, body));
            ctx.body = validType;
            span.setAttribute('http.request.valid', true);
            return runWithSpan(span, async () => await next(ctx));
        } catch (validationErrors) {
            ctx.status = 400;
            const response = mapErrorToResponse(validationErrors);
            span.setAttribute('http.validation.errors', JSON.stringify(response.errors));
            span.setAttribute('http.request.valid', false);
            span.setStatus({ code: SpanStatusCode.ERROR });
            ctx.body = response;
            return response;
        } finally {
            span.end();
        }
    }
}

const mapErrorToResponse = (errors) => {
    const validationErrors = errors.map(error => {
        const errorMessages = Object.values(error.constraints);
        return { property: error.property, constraints: errorMessages };
    });
    
    return {
        errors: validationErrors
    }
}

export { validate };