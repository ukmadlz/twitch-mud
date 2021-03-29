const nextHandlerWrapper = (app) => {
  const handler = app.getRequestHandler();
  return async ({ raw, url, query }, h) => {
    const newUrl = url;
    newUrl.query = query;
    await handler(raw.req, raw.res, newUrl);
    return h.close;
  };
};

const pathWrapper = (app, pathName, opts) => async (
  { raw, query, params },
  h,
) => {
  const html = await app.render(
    raw.req,
    raw.res,
    pathName,
    { ...query, ...params },
    opts,
  );
  return h.response(html).code(raw.res.statusCode);
};

module.exports = {
  pathWrapper,
  nextHandlerWrapper,
};
