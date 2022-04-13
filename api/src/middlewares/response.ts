const jsonResponse = (statusCode: Number = 200) => {
    return async function jsonResponse (ctx, next) {
        try {
            const response = await next();
            ctx.status = statusCode;
            ctx.body = response;
        } catch (ex) {
            ctx.status = 500;
        }
    }
}

export { jsonResponse }