require('dotenv').config();
const KoaRouter = require('koa-router');
const jwtgenerator = require('jsonwebtoken');

const router = new KoaRouter();

function generateToken(user) {
  return new Promise((resolve, reject) => {
    jwtgenerator.sign(
      { sub: user.id },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 30 }, // 30 min tokens
      (err, tokenResult) => (err ? reject(err) : resolve(tokenResult)),
    );
  });
}

// 2. Inicio de sesión de usuario
router.post('api.auth.login', '/', async (ctx) => {
  try {
    const { email, password } = ctx.request.body;
    // Si no ingresa mail o contraseña
    if (!email) ctx.throw(400, 'No email provided');
    if (!password) ctx.throw(400, 'No password provided');

    const user = await ctx.orm.User.scope('withPassword').findOne({ where: { email } });

    const cleanUser = await ctx.orm.User.findByPk(user.id);
    // Si no hay un usuario con el email ingresado
    if (!user) ctx.throw(404, `No user found with ${email}`);
    const authenticated = await user.checkPassword(password);

    // Si la contraseña ingresada es incorrecta
    if (!authenticated) ctx.throw(401, 'Invalid password');
    const token = await generateToken(user);
    // follow OAuth RFC6749 response standart
    // https://datatracker.ietf.org/doc/html/rfc6749#section-5.1

    ctx.status = 200;
    ctx.body = {
      code: 200,
      msg: 'User logged successfully',
      data: {
        access_token: token,
        token_type: 'Bearer',
        user: cleanUser,
      },
    };
  } catch (err) {
    if ([400, 401, 404].includes(err.status)) {
      ctx.status = err.status;
      ctx.body = { code: err.status, msg: err.message };
    } else {
      ctx.status = 500;
      ctx.body = { code: 500, msg: 'Server error' };
    }
  }
});

module.exports = router;
