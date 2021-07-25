const supertest = require('supertest');
// const { format } = require('date-fns');
const app = require('../../app');

const request = supertest(app.callback());

describe('Auth API routes', () => {
  // crear usuario
  const userFields = {
    username: 'username_auth',
    first_name: 'name1',
    last_name: 'lastname1',
    email: 'email_auth@uc.cl',
    password: 'test123',
    description: 'soy una persona',
  };

  beforeAll(async () => {
    // sincronizar base de datos
    await app.context.orm.sequelize.sync({ force: true });

    // crear usuario en db
    await app.context.orm.User.create(userFields);
  });
  // cerrar la conexión con sequelize
  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  // 2. Inicio de sesión de usuario
  describe('POST /auth', () => {
    let response;
    // usar variable request para hacer un post
    const authResponse = () => request
      .post('/auth')
      .set('Content-type', 'application/json')
      .send({ email: userFields.email, password: userFields.password });

    // la información ingresada para registrarse es válida
    describe('user data is valid', () => {
      beforeAll(async () => {
        response = await authResponse();
      });

      test('responds with 200 status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a json body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('body matches snapshot', () => {
        // expect(response.body).toMatchSnapshot();
        expect(response.body).toMatchSnapshot({ data: { access_token: expect.any(String) } });
      });
    });
  });
});
