const KoaRouter = require('koa-router');
const errorHandler = require('../helpers/error');

const router = new KoaRouter();

// Secondary route, 21. overall
// 8. DELETE admin/books/:book_id
router.delete('api.admin.deleteBook', '/books/:book_id', async (ctx) => {
  try {
    const book = await ctx.orm.Book.findByPk(ctx.params.book_id);
    if (!book) ctx.throw(404, 'Book not found');
    if (!ctx.state.currentUser.is_admin) ctx.throw(403, 'Permission denied');
    await book.destroy();

    ctx.code = 200;
    ctx.body = {
      code: 200,
      msg: 'Book deleted successfully',
      data: await ctx.orm.Book.findAll(),
    };
  } catch (err) {
    errorHandler(ctx, err);
  }
});

// Secondary route, 22. overall
// 9. DELETE admin/users/:user_id
router.delete('api.admin.deleteUser', '/users/:user_id', async (ctx) => {
  try {
    const user = await ctx.orm.User.findByPk(ctx.params.user_id);
    if (!user) ctx.throw(404, 'User not found');
    if (!ctx.state.currentUser.is_admin) ctx.throw(403, 'Permission denied');
    await user.destroy();

    ctx.code = 200;
    ctx.body = {
      code: 200,
      msg: 'User deleted successfully',
      data: await ctx.orm.User.findAll(),
    };
  } catch (err) {
    errorHandler(ctx, err);
  }
});

module.exports = router;
