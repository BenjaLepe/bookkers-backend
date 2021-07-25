async function updateReview(ctx, review) {
  const newData = {
    title: ctx.request.body.title,
    body: ctx.request.body.body,
  };
  if (ctx.request.body.BookId && ctx.request.body.BookId !== review.BookId) {
    ctx.throw(400, 'You can not modify BookId of review');
  }
  if (ctx.request.body.UserId && ctx.request.body.UserId !== review.UserId) {
    ctx.throw(400, 'You can not modify UserId of review');
  }
  await ctx.orm.Review.update(
    newData,
    {
      where: {
        id: review.id,
      },
    },
  );
}

module.exports = updateReview;
