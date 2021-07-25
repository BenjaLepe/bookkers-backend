// Handler for error response
function errorHandler(ctx, err) {
  if (err.errors) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      msg: `${err.errors[0].message}`,
    };
  } else if (err.parent) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      msg: `DB error: ${err.parent.error}`,
    };
  } else {
    ctx.status = err.status;
    ctx.body = {
      code: err.status,
      msg: err.message,
    };
  }
}

module.exports = errorHandler;
