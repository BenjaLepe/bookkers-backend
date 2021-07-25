require('dotenv').config();
const KoaRouter = require('koa-router');
const jwt = require('koa-jwt');
const { apiSetCurrentUser } = require('./middlewares/auth');
const users = require('./routes/users');
const auth = require('./routes/auth');
const books = require('./routes/books');
const admin = require('./routes/admin');

const router = new KoaRouter();

/* Unprotected routes */
router.use('/auth', auth.routes());
router.use('/users', users.routes());
router.use('/books', books.routes());

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

/* Protected routes */
router.use(jwt({ secret: process.env.JWT_SECRET, key: 'authData' }));
router.use(apiSetCurrentUser);
router.use('/admin', admin.routes());

module.exports = router;
