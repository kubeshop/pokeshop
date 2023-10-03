import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { createSpan, getParentSpan, runWithSpan } from '@pokemon/telemetry/tracing';
import { transformAndValidate } from 'class-transformer-validator';
import { CustomTags } from '../constants/Tags';

const validate = type => {
  return async function validate(ctx, next) {
    const parentSpan = await getParentSpan();
    const span = await createSpan('validate request', parentSpan, { kind: SpanKind.INTERNAL });
    span.addEvent("validation started")

    const body = ctx.request.body;
    try {
      const validType = await runWithSpan(span, async () => await transformAndValidate(type, body));
      ctx.body = validType;
      span.setAttribute(CustomTags.VALIDATION_IS_VALID, true);
      span.addEvent("request is valid", {[CustomTags.VALIDATION_IS_VALID]: true})
      return runWithSpan(span, async () => await next(ctx));
    } catch (validationErrors) {
      ctx.status = 400;
      const response = mapErrorToResponse(validationErrors);

      span.setAttributes({
        [CustomTags.VALIDATION_ERRORS]: JSON.stringify(response.errors),
        [CustomTags.VALIDATION_IS_VALID]: false,
      });
      span.addEvent("request is invalid", {
        [CustomTags.VALIDATION_ERRORS]: JSON.stringify(response.errors),
        [CustomTags.VALIDATION_IS_VALID]: false,
      })

      span.setStatus({ code: SpanStatusCode.ERROR });
      ctx.body = response;
      return response;
    } finally {
      span.end();
    }
  };
};

const mapErrorToResponse = errors => {
  const validationErrors = errors.map(error => {
    const errorMessages = Object.values(error.constraints);
    return { property: error.property, constraints: errorMessages };
  });

  return {
    errors: validationErrors,
  };
};

export { validate };
