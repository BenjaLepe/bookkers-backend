const KoaRouter = require('koa-router');
const jwt = require('koa-jwt');
const { apiSetCurrentUser } = require('../middlewares/auth');
const errorHandler = require('../helpers/error');
const updateReview = require('../helpers/reviews');
const updateBook = require('../helpers/books');
const pages = require('../helpers/pages');
const reviewLikes = require('../helpers/likes');

const router = new KoaRouter();

// const reviews = await ctx.orm.Review.findAll({
//   where: {
//     BookId: ctx.params.book_id,
//   },
// });
// if (!reviews.length) ctx.throw(200, 'Request successful, but book does not have reviews');

// Middleware from https://www.npmjs.com/package/koa-jwt#token-verification-exceptions
// Custom 401 handling (first middleware)
router.use((ctx, next) => next().catch((err) => {
  if (err.status === 401) {
    ctx.status = 401;
    ctx.body = {
      code: err.status,
      msg: err.originalError ? err.originalError.message : err.message,
    };
  } else {
    throw err;
  }
}));

// Protected endpoints
router.use(jwt({ secret: process.env.JWT_SECRET, key: 'authData' }));
router.use(apiSetCurrentUser);

// 6. Ver coleccion de libros
router.get('api.books.some', '/', async (ctx) => {
  try {
    const { page } = ctx.request.query;
    if (page && !parseInt(page, 10)) ctx.throw(400, 'Page number must be a number');

    const books = await ctx.orm.Book.findAndCountAll();
    const { totalPages, pageItems } = pages(page, books);

    ctx.status = 200;
    ctx.body = {
      code: 200,
      msg: 'Request successful',
      data: {
        pageNumber: parseInt(page, 10) || 1,
        totalPages,
        books: pageItems,
      },
    };
  } catch (err) {
    errorHandler(ctx, err);
  }
});

// 7. POST /books, crear un libro con un ISBN único
router.post('api.books.create', '/', async (ctx) => {
  try {
    let book = await ctx.orm.Book.build(ctx.request.body);
    await book.save({ fields: ['name', 'ISBN', 'editorial', 'genre', 'author', 'pages_number', 'image'] });
    ctx.status = 201;
    book = await ctx.orm.Book.findOne(
      {
        where: {
          name: ctx.request.body.name,
        },
      },
    );
    ctx.body = { code: 201, msg: 'Book created successfully', data: book };
    // return ctx;
  } catch (err) {
    errorHandler(ctx, err);
  }
});

// 8. GET /books/:book_id: obtener detalle de un libro
router.get('api.books.show', '/:book_id', async (ctx) => {
  try {
    // Encontrar un libro especifico
    const book = await ctx.orm.Book.findOne({
      where: {
        id: ctx.params.book_id,
      },
    });

    if (!book) ctx.throw(404, 'Book not found');

    ctx.status = 200;
    ctx.body = { code: 200, msg: 'Book found successfully', data: book };
  } catch (err) {
    errorHandler(ctx, err);
  }
});

// 9. Update book data
router.patch('api.books.patch', '/:book_id', async (ctx) => {
  const user = ctx.state.currentUser;
  try {
    if (!user.is_admin) ctx.throw(403, 'Only admin users can modify books');

    const book = await ctx.orm.Book.findOne({
      where: {
        id: ctx.params.book_id,
      },
    });
    if (!book) ctx.throw(400, 'Book not found');
    await updateBook(ctx, book);
    await book.reload();
    ctx.status = 200;
    ctx.body = { code: 200, msg: 'Book modified successfully', data: book };
  } catch (err) {
    errorHandler(ctx, err);
  }
});

// 10. Get reviews for a book with id = book_id
router.get('api.book.reviews', '/:book_id/reviews', async (ctx) => {
  try {
    const book = await ctx.orm.Book.findByPk(ctx.params.book_id);
    if (!book) ctx.throw(404, 'Book not found');

    const reviews = await ctx.orm.Review.findAndCountAll({ include: 'User', where: { BookId: ctx.params.book_id } });
    if (!reviews.count) ctx.throw(200, 'Request successful, but book does not have reviews');

    reviews.rows = await Promise.all(reviews.rows.map(async (review) => {
      const newReview = review;
      newReview.dataValues.likes = await reviewLikes(ctx, review.id);
      return newReview;
    }));

    const { page } = ctx.request.query;
    if (page && !parseInt(page, 10)) ctx.throw(400, 'Page number must be a number');

    const { totalPages, pageItems } = pages(page, reviews);

    ctx.status = 200;
    ctx.body = {
      code: 200,
      msg: 'Request successful',
      data: {
        pageNumber: parseInt(page, 10) || 1,
        totalPages,
        reviews: pageItems,
      },
    };
  } catch (err) {
    errorHandler(ctx, err);
  }
});

// 11. Post book review
router.post('api.books.addReview', '/:book_id/reviews', async (ctx) => {
  try {
    const book = await ctx.orm.Book.findOne({
      where: {
        id: ctx.params.book_id,
      },
    });
    if (!book) ctx.throw(400, 'Book not found');

    let review = ctx.orm.Review.build(ctx.request.body);
    review.UserId = ctx.state.currentUser.id;
    review.BookId = ctx.params.book_id;
    await review.save({ fields: ['UserId', 'BookId', 'title', 'body'] });
    review = await ctx.orm.Review.findOne({
      where: {
        id: review.id,
      },
    });
    ctx.status = 201;
    ctx.body = {
      code: 201,
      msg: 'Review created successfully',
      data: review,
    };
  } catch (err) {
    errorHandler(ctx, err);
  }
});

// 12. Get single review of book
router.get('api.books.review', '/:book_id/reviews/:review_id', async (ctx) => {
  try {
    const book = await ctx.orm.Book.findOne({
      where: {
        id: ctx.params.book_id,
      },
    });
    if (!book) ctx.throw(404, 'Book not found');

    const review = await ctx.orm.Review.findOne({
      include: [{
        model: ctx.orm.User,
        attributes: ['username'],
      }, {
        model: ctx.orm.Book,
        attributes: ['name'],
      }],
      where: {
        id: ctx.params.review_id,
        BookId: ctx.params.book_id,
      },
    });

    if (!review) ctx.throw(404, 'Review not found');

    review.dataValues.likes = await reviewLikes(ctx, review.id);

    ctx.status = 200;
    ctx.body = {
      code: 200,
      msg: 'Request successful',
      data: review,
    };
  } catch (err) {
    errorHandler(ctx, err);
  }
});

// 13. Patch book review
router.patch('api.books.patchReview', '/:book_id/reviews/:review_id', async (ctx) => {
  try {
    const book = await ctx.orm.Book.findOne({
      where: {
        id: ctx.params.book_id,
      },
    });
    if (!book) ctx.throw(404, 'Book not found');

    const review = await ctx.orm.Review.findOne({
      where: {
        id: ctx.params.review_id,
        BookId: ctx.params.book_id,
      },
    });
    if (!review) ctx.throw(404, 'Review not found');

    if (!ctx.state.currentUser.is_admin && ctx.state.currentUser.id !== review.UserId) {
      ctx.throw(403, 'Permission denied');
    }

    await updateReview(ctx, review);
    await review.reload();
    ctx.status = 200;
    ctx.body = {
      code: 200,
      msg: 'Review updated successfully',
      data: review,
    };
  } catch (err) {
    errorHandler(ctx, err);
  }
});

// secondary route, 16 overall
// 3. POST /books/:book_id/reviews/:review_id/likes
router.post('api.books.like', '/:book_id/reviews/:review_id/likes', async (ctx) => {
  try {
    const user = ctx.state.currentUser;

    const book = await ctx.orm.Book.findOne({
      where: {
        id: ctx.params.book_id,
      },
    });

    if (!book) ctx.throw(404, 'Book not found');

    const review = await ctx.orm.Review.findOne({
      where: {
        id: ctx.params.review_id,
        BookId: ctx.params.book_id,
      },
    });

    if (!review) ctx.throw(404, 'Review not found');

    const isLiked = await user.hasLike(review);

    if (isLiked) ctx.throw(400, 'Review already liked by user');

    // Agregar like
    await user.addLike(review);
    await review.reload();

    ctx.status = 201;
    ctx.body = {
      code: 201,
      msg: 'Review liked successfully',
      data: review,
    };
  } catch (err) {
    errorHandler(ctx, err);
  }
});

// secondary route, 17 overall
// 4. DELETE /books/:book_id/reviews/:review_id/likes
router.delete('api.books.unlike', '/:book_id/reviews/:review_id/likes', async (ctx) => {
  try {
    const user = ctx.state.currentUser;

    const book = await ctx.orm.Book.findOne({
      where: {
        id: ctx.params.book_id,
      },
    });

    if (!book) ctx.throw(404, 'Book not found');

    const review = await ctx.orm.Review.findOne({
      where: {
        id: ctx.params.review_id,
        BookId: ctx.params.book_id,
      },
    });

    if (!review) ctx.throw(404, 'Review not found');

    const isLiked = await user.hasLike(review);

    if (!isLiked) ctx.throw(400, 'Review not liked by user');

    // Eliminar like
    await user.removeLike(review);
    await review.reload();

    ctx.status = 200;
    ctx.body = {
      code: 200,
      msg: 'Review unliked successfully',
      data: review,
    };
  } catch (err) {
    errorHandler(ctx, err);
  }
});

// Secondary endpoint, 18 overall
// 5. DELETE /books/:book_id/reviews/:review_id
router.delete('api.books.deleteReview', '/:book_id/reviews/:review_id', async (ctx) => {
  try {
    const book = await ctx.orm.Book.findByPk(ctx.params.book_id);
    if (!book) ctx.throw(404, 'Book not found');

    const review = await ctx.orm.Review.findOne({
      where: {
        id: ctx.params.review_id,
        BookId: ctx.params.book_id,
      },
    });
    if (!review) ctx.throw(404, 'Review not found');

    if (!ctx.state.currentUser.is_admin && ctx.state.currentUser.id !== review.UserId) {
      ctx.throw(403, 'Permission denied');
    }

    await review.destroy();
    await book.reload();
    ctx.status = 201;
    ctx.body = {
      code: 201,
      msg: 'Review deleted successfully',
      data: await book.getReviews(),
    };
  } catch (err) {
    errorHandler(ctx, err);
  }
});

// Secondary endpoint, 19 overall
// 6. POST /books/:book_id/reviews/:review_id/reports
router.post('api.books.addReport', '/:book_id/reviews/:review_id/reports', async (ctx) => {
  try {
    const book = await ctx.orm.Book.findByPk(ctx.params.book_id);
    if (!book) ctx.throw(404, 'Book not found');

    const review = await ctx.orm.Review.findOne({
      where: {
        id: ctx.params.review_id,
        BookId: ctx.params.book_id,
      },
    });
    if (!review) ctx.throw(404, 'Review not found');

    if (!ctx.state.currentUser) ctx.throw(403, 'Permission denied');

    let report = ctx.orm.Report.build(ctx.request.body);
    report.UserId = ctx.state.currentUser.id;
    report.ReviewId = review.id;
    await report.save({ fields: ['UserId', 'ReviewId', 'comment'] });
    report = await ctx.orm.Report.findByPk(report.id);

    ctx.status = 201;
    ctx.body = {
      code: 201,
      msg: 'Report created successfully',
      data: report,
    };
  } catch (err) {
    errorHandler(ctx, err);
  }
});

// Secondary endpoint, 20 overall
// 7. GET Obtener todos los reportes de una review
router.get('api.books.getReports', '/:book_id/reviews/:review_id/reports', async (ctx) => {
  try {
    if (!ctx.state.currentUser.is_admin) ctx.throw(403, 'Permission denied');
    const book = await ctx.orm.Book.findByPk(ctx.params.book_id);
    if (!book) ctx.throw(404, 'Book not found');

    const review = await ctx.orm.Review.findOne({
      include: [{
        model: ctx.orm.User,
        attributes: ['username'],
      }, {
        model: ctx.orm.Book,
        attributes: ['name'],
      }],
      where: {
        id: ctx.params.review_id,
        BookId: ctx.params.book_id,
      },
    });

    if (!review) ctx.throw(404, 'Review not found');

    review.dataValues.likes = await reviewLikes(ctx, review.id);

    // Pagination plugin
    const { page } = ctx.request.query;
    if (page && !parseInt(page, 10)) ctx.throw(400, 'Page number must be a number');

    const reportArray = await ctx.orm.Report.findAll({
      include: [{
        model: ctx.orm.User,
        attributes: ['username'],
      }],
      where: {
        ReviewId: ctx.params.review_id,
      },
    });
    const reports = { count: reportArray.length, rows: reportArray };
    const { totalPages, pageItems } = pages(page, reports);

    ctx.status = 200;
    ctx.body = {
      code: 200,
      msg: 'Reports found successfully',
      data: {
        pageNumber: parseInt(page, 10) || 1,
        totalPages,
        review,
        reports: pageItems,
      },
    };
  } catch (err) {
    errorHandler(ctx, err);
  }
});

module.exports = router;
