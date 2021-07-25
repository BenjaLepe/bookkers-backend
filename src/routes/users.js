const KoaRouter = require('koa-router');
const jwt = require('koa-jwt');
const { apiSetCurrentUser } = require('../middlewares/auth');
const { updateUser, cmpPasswordsEdit } = require('../helpers/users');
const errorHandler = require('../helpers/error');
const pages = require('../helpers/pages');
const reviewLikes = require('../helpers/likes');

const router = new KoaRouter();

// 1. Registro de usuarios
router.post('api.users.create', '/', async (ctx) => {
  try {
    let user = await ctx.orm.User.build(ctx.request.body);
    await user.save({ fields: ['username', 'first_name', 'last_name', 'email', 'password', 'profile_picture', 'description'] });
    user = await ctx.orm.User.findOne(
      {
        where: {
          username: ctx.request.body.username,
        },
      },
    );
    ctx.status = 201;
    ctx.body = { code: 201, msg: 'User created successfully', data: user };
  } catch (err) {
    errorHandler(ctx, err);
  }
});

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

// Desde acá, las rutas están protegidas (piden autenticación)
router.use(jwt({ secret: process.env.JWT_SECRET, key: 'authData' }));
router.use(apiSetCurrentUser);

// 3. Información de un usuario logueado
// 4. Información de un usuario
router.get('api.users.show', '/:user_id', async (ctx) => {
  try {
    let user;
    // Encontrar un usuario especifico
    if (ctx.params.user_id === 'me') {
      user = ctx.state.currentUser;
    } else {
      user = await ctx.orm.User.findOne({
        where: {
          id: ctx.params.user_id,
        },
      });
    }
    if (!user) {
      ctx.throw(404, 'User not found');
    }

    ctx.status = 200;
    ctx.body = { code: 200, msg: 'User found successfully', data: user };
  } catch (err) {
    errorHandler(ctx, err);
  }
});

// 5. Modificar información de usuario logueado
router.patch('api.users.patch', '/:user_id', async (ctx) => {
  try {
    // Si la nueva contraseña y su confirmación no coinciden
    if (ctx.request.body.password) {
      await cmpPasswordsEdit(ctx);
    }
    // Si se quiere modificar a otro usuario
    if (!ctx.state.currentUser.is_admin
      && ctx.state.currentUser.id !== Number(ctx.params.user_id)) {
      ctx.throw(403, 'You are not allowed to modify other users');
    }
    const user = await ctx.orm.User.findOne(
      {
        where: {
          id: ctx.params.user_id,
        },
      },
    );
    // Utilizamos el helper para actualizar el usuario.
    await updateUser(ctx, user);
    // Volvemos a cargar el usuario para reflejar los cambios
    await user.reload();
    ctx.status = 200;
    ctx.body = { code: 200, msg: 'User modified successfully', data: user };
  } catch (err) {
    errorHandler(ctx, err);
  }
});

// secondary route, 14 overall
// 1. GET /users/:user_id/reviews
router.get('api.users.reviews', '/:user_id/reviews', async (ctx) => {
  try {
    const user = await ctx.orm.User.findByPk(ctx.params.user_id);
    if (!user) ctx.throw(404, 'User not found');

    const reviews = await ctx.orm.Review.findAndCountAll({ include: 'Book', where: { UserId: ctx.params.user_id } });
    if (reviews.count === 0) ctx.throw(200, 'Request successful, but user has not written reviews');

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

// secondary route, 15 overall
// 2. GET /users/:user_id/liked_reviews
router.get('api.users.liked_reviews', '/:user_id/liked_reviews', async (ctx) => {
  try {
    const user = await ctx.orm.User.findOne({
      include: 'likes',
      where: {
        id: ctx.params.user_id,
      },
    });
    if (!user) ctx.throw(404, 'User not found');

    const userData = await user.getLikes();
    if (userData.length === 0) ctx.throw(200, 'Request successful, but user has not liked reviews');

    const cleanUserData = await Promise.all(userData.map(async (item) => ({
      id: item.id,
      UserId: item.UserId,
      BookId: item.BookId,
      Book: await ctx.orm.Book.findByPk(item.BookId),
      User: await ctx.orm.User.findByPk(item.UserId),
      title: item.title,
      body: item.body,
      likes: await reviewLikes(ctx, item.id),
    })));

    // Pagination plugin
    const { page } = ctx.request.query;
    if (page && !parseInt(page, 10)) ctx.throw(400, 'Page number must be a number');

    const likes = { count: cleanUserData.length, rows: cleanUserData };
    const { totalPages, pageItems } = pages(page, likes);

    ctx.status = 200;
    ctx.body = {
      code: 200,
      msg: 'Reviews found successfully',
      data: {
        pageNumber: parseInt(page, 10) || 1,
        totalPages,
        likedReviews: pageItems,
      },
    };
  } catch (err) {
    errorHandler(ctx, err);
  }
});

module.exports = router;
