const jsonResponse = (statusCode: Number = 200) => {
    return async function jsonResponse (ctx, next) {
        try {
            ctx.status = statusCode;
            const response = await next(ctx);
            const status = ctx.status;
            ctx.body = response;
            // This is needed because if ctx.body is null or undefined, ctx.status is set to 204
            ctx.status = status;
        } catch (ex) {
            ctx.status = 500;
            ctx.body = {};
        }
    }
}

export { jsonResponse }