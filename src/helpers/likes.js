const reviewLikes = async (ctx, reviewId) => {
  const review = await ctx.orm.Review.findByPk(reviewId, { include: 'likes' });
  const likes = review.likes.map((like) => like.id);
  return likes;
};

module.exports = reviewLikes;
