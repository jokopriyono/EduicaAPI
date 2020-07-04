module.exports = async (ctx, next) => {
  await next();
  if (ctx.response.is('json')) {
    const originalResponse = ctx.response;
    ctx.body = {
      code: originalResponse.status,
      status: originalResponse.message,
      data: originalResponse.body,
    };
  }
};
