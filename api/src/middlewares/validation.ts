import { createSpan, getParentSpan, runWithSpan } from '@pokemon/telemetry/tracing';
import { transformAndValidate } from 'class-transformer-validator';

const validate = (type) => {
    return async function validate(ctx, next) {
        const parentSpan = await getParentSpan();
        const span = await createSpan('middleware validate', parentSpan);

        const body = ctx.request.body;
        try {
            const validType = await runWithSpan(span, async () => await transformAndValidate(type, body));
            ctx.body = validType;
            return runWithSpan(span, async () => await next(ctx));
        } catch (validationErrors) {
            ctx.status = 400;
            ctx.body = mapErrorToResponse(validationErrors);
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