const supertest = require('supertest');
// const { format } = require('date-fns');
const bcrypt = require('bcrypt');

// const PASSWORD_SALT_ROUNDS = 10;
const app = require('../../app');

const request = supertest(app.callback());

describe('User API routes', () => {
  // contiene token
  let auth;
  let authUser;
  // crear usuario
  const userFields = {
    username: 'username1',
    first_name: 'name1',
    last_name: 'lastname1',
    email: 'email1@uc.cl',
    password: 'test123',
    description: 'soy una persona',
  };

  beforeAll(async () => {
    // sincronizar base de datos
    await app.context.orm.sequelize.sync({ force: true });

    // crear usuario en db
    authUser = await app.context.orm.User.create(userFields);
    // await authUser.save();

    // usar variable request para hacer un post
    const authResponse = await request
      .post('/auth')
      .set('Content-type', 'application/json')
      .send({ email: userFields.email, password: userFields.password });
    // asignarle a auth la respuesta
    auth = authResponse.body;
  });
  // cerrar la conexión con sequelize
  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });
  // 3. Información de un usuario logueado
  // 4. Información de un usuario
  describe('GET /users/:user_id', () => {
    let user;
    let response;
    const userData = {
      username: 'username2',
      first_name: 'name2',
      last_name: 'lastname2',
      email: 'email2@uc.cl',
      password: 'test123',
      description: 'soy una persona',
    };
    const authorizedGetUser = (id) => request
      .get(`/users/${id}`)
      .auth(auth.data.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json');
    const authorizedGetUserMe = () => request
      .get('/users/me')
      .auth(auth.data.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json');
    const unauthorizedGetUser = (id) => request
      .get(`/users/${id}`)
      .set('Content-type', 'application/json');

    beforeAll(async () => {
      user = await app.context.orm.User.create(userData);
    });
    afterAll(async () => {
      await user.destroy();
    });

    // cuando se usa la ruta users/me
    describe('when me is passed instead of id', () => {
      beforeAll(async () => {
        response = await authorizedGetUserMe();
      });
      test('responds with 200 status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a json body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('body matches snapshot', () => {
        expect(response.body).toMatchSnapshot();
      });
    });

    // id que se la pasa a la ruta existe en la base de datos y esta logueado
    describe('when passed id corresponds to an existing user', () => {
      beforeAll(async () => {
        response = await authorizedGetUser(user.id);
      });

      test('responds with 200 status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a json body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('body matches snapshot', () => {
        expect(response.body).toMatchSnapshot();
      });
    });
    // id que se le pasa a la ruta no corresponde a algun user en db y esta logueado
    describe('when passed id does not correspond to any user', () => {
      test('responds with 404 status code', async () => {
        response = await authorizedGetUser(user.id * -1);
        expect(response.status).toBe(404);
      });
    });

    // user no está logueado
    describe('when request is unauthorized because user is not logged in', () => {
      test('responds with 401 status code', async () => {
        response = await unauthorizedGetUser(user.id);
        expect(response.status).toBe(401);
      });
    });
  });
  // 1. Registro de usuarios
  describe('POST /users', () => {
    let response;
    const userData = {
      username: 'username3',
      first_name: 'name3',
      last_name: 'lastname3',
      email: 'email3@uc.cl',
      password: 'test123',
      description: 'soy una persona',
    };
    const PostUser = () => request
      .post('/users')
      .set('Content-type', 'application/json')
      .send(userData);

    afterAll(async () => {
      const createdUser = await app.context.orm.User.findOne({
        where: { username: userData.username },
      });
      await createdUser.destroy();
    });

    // la información ingresada para registrarse es válida
    describe('user data is valid', () => {
      let userCheck;
      let passwordCheck;
      beforeAll(async () => {
        response = await PostUser();
        userCheck = await app.context.orm.User.scope('withPassword').findByPk(response.body.data.id);
        passwordCheck = await bcrypt.compare(userData.password, userCheck.password);
      });
      test('responds with 201 status code', () => {
        expect(response.status).toBe(201);
      });
      test('responds with a json body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('response for POST user contains an id', () => {
        expect(response.body.data.id).toBeDefined();
      });

      test('body matches snapshot', () => {
        expect(response.body).toMatchSnapshot();
      });

      test('password in database is correct', () => {
        expect(passwordCheck).toBe(true);
      });

      test('post request actually created the given user', async () => {
        delete userData.password;
        const {
          username, email, description,
        } = userCheck.dataValues;
        const sanitizedUser = {
          username,
          first_name: userCheck.dataValues.first_name,
          last_name: userCheck.dataValues.last_name,
          email,
          description,
        };
        expect(sanitizedUser).toEqual(userData);
      });
    });
  });
  // 5. Modificar información de usuario logueado
  describe('PATCH /users/:user_id', () => {
    let response;
    const userData = {
      username: 'username4',
      first_name: 'name4',
      last_name: 'lastname4',
      email: 'email4@uc.cl',
      password: 'test1234',
      confirm_password: 'test1234',
      description: 'soy una persona',
    };
    const authorizedPatchUser = (id) => request
      .patch(`/users/${id}`)
      .auth(auth.data.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(userData);

    // la información ingresada para modificar es válida
    describe('user data to modify is valid', () => {
      let userCheck;
      let passwordCheck;

      beforeAll(async () => {
        response = await authorizedPatchUser(authUser.id);
        userCheck = await app.context.orm.User.scope('withPassword').findByPk(authUser.id);
        passwordCheck = await bcrypt.compare(userData.password, userCheck.password);
      });
      test('responds with 200 status code', () => {
        expect(response.status).toBe(200);
      });
      test('responds with a json body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('body matches snapshot', () => {
        expect(response.body).toMatchSnapshot();
      });

      test('password in database is correct', async () => {
        expect(passwordCheck).toBe(true);
      });

      test('patch request actually modified the given user', async () => {
        delete userData.password;
        delete userData.confirm_password;
        const { username, email, description } = userCheck.dataValues;
        const sanitizedUser = {
          username,
          first_name: userCheck.dataValues.first_name,
          last_name: userCheck.dataValues.last_name,
          email,
          description,
        };

        expect(sanitizedUser).toEqual(userData);
      });
    });
  });
  // 1. secundaria (14) obtener colección de reseñas hechas por un usuario
  describe('GET /users/:user_id/reviews', () => {
    let user;
    let book;
    let review;
    let response;
    const userData = {
      username: 'username5',
      first_name: 'name5',
      last_name: 'lastname5',
      email: 'email5@uc.cl',
      password: 'test123',
      description: 'soy una persona',
    };

    const bookData = {
      name: 'TestBook',
      ISBN: '123-4-56-78910-0',
      editorial: 'TestEditorial',
      pages_number: 123,
      author: 'TestAuthor',
      genre: 'TestGenre',
    };

    const authorizedGetUserReviews = (id) => request
      .get(`/users/${id}/reviews`)
      .auth(auth.data.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json');
    const unauthorizedGetUserReviews = (id) => request
      .get(`/users/${id}/reviews`)
      .set('Content-type', 'application/json');

    beforeAll(async () => {
      user = await app.context.orm.User.create(userData);
      book = await app.context.orm.Book.create(bookData);
      const reviewData = {
        UserId: user.id,
        BookId: book.id,
        title: 'TestTitle',
        body: 'TestBody',
      };
      review = await app.context.orm.Review.create(reviewData);
    });
    afterAll(async () => {
      await review.destroy();
      await user.destroy();
      await book.destroy();
    });

    // id que se la pasa a la ruta existe en la base de datos y esta logueado
    describe('when passed id corresponds to an existing user and they have at least one review', () => {
      beforeAll(async () => {
        response = await authorizedGetUserReviews(user.id);
      });

      test('responds with 200 status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a json body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('body matches snapshot', () => {
        expect(response.body).toMatchSnapshot();
      });
    });
    // id que se la pasa a la ruta existe en la base de datos y esta logueado
    describe('when passed id corresponds to an existing user but they do not have reviews', () => {
      beforeAll(async () => {
        response = await authorizedGetUserReviews(authUser.id);
      });

      test('responds with 200 status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a json body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('body matches snapshot', () => {
        expect(response.body).toMatchSnapshot();
      });
    });
    // id que se le pasa a la ruta no corresponde a algun user en db y esta logueado
    describe('when passed id does not correspond to any user', () => {
      test('responds with 404 status code', async () => {
        response = await authorizedGetUserReviews(user.id * -1);
        expect(response.status).toBe(404);
      });
    });

    // user no está logueado
    describe('when request is unauthorized because user is not logged in', () => {
      test('responds with 401 status code', async () => {
        response = await unauthorizedGetUserReviews(user.id);
        expect(response.status).toBe(401);
      });
    });
  });
  // 2. secundaria (15) obtener colección de reseñas con like por un usuario
  describe('GET /users/:user_id/liked_reviews', () => {
    let user1;
    let user2;
    let book;
    let review;
    let response;
    const userData1 = {
      username: 'username5',
      first_name: 'name5',
      last_name: 'lastname5',
      email: 'email5@uc.cl',
      password: 'test123',
      description: 'soy una persona',
    };
    const userData2 = {
      username: 'username6',
      first_name: 'name6',
      last_name: 'lastname6',
      email: 'email6@uc.cl',
      password: 'test123',
      description: 'soy una persona',
    };

    const bookData = {
      name: 'TestBook',
      ISBN: '123-4-56-78910-0',
      editorial: 'TestEditorial',
      pages_number: 123,
      author: 'TestAuthor',
      genre: 'TestGenre',
    };

    const authorizedGetUserLikedReviews = (id) => request
      .get(`/users/${id}/liked_reviews`)
      .auth(auth.data.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json');
    const unauthorizedGetUserLikedReviews = (id) => request
      .get(`/users/${id}/liked_reviews`)
      .set('Content-type', 'application/json');

    beforeAll(async () => {
      user1 = await app.context.orm.User.create(userData1);
      user2 = await app.context.orm.User.create(userData2);
      book = await app.context.orm.Book.create(bookData);
      const reviewData = {
        UserId: user2.id,
        BookId: book.id,
        title: 'TestTitle',
        body: 'TestBody',
      };
      review = await app.context.orm.Review.create(reviewData);
      await user1.addLike(review);
    });
    afterAll(async () => {
      user1.removeLike(review);
      await review.destroy();
      await user1.destroy();
      await user2.destroy();
      await book.destroy();
    });

    // id que se la pasa a la ruta existe en la base de datos y esta logueado
    describe('when passed id corresponds to an existing user and they have at least one review', () => {
      beforeAll(async () => {
        response = await authorizedGetUserLikedReviews(user1.id);
      });

      test('responds with 200 status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a json body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('body matches snapshot', () => {
        expect(response.body).toMatchSnapshot();
      });
    });
    // id que se la pasa a la ruta existe en la base de datos y esta logueado
    describe('when passed id corresponds to an existing user but they do not have reviews', () => {
      beforeAll(async () => {
        response = await authorizedGetUserLikedReviews(authUser.id);
      });

      test('responds with 200 status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a json body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('body matches snapshot', () => {
        expect(response.body).toMatchSnapshot();
      });
    });
    // id que se le pasa a la ruta no corresponde a algun user en db y esta logueado
    describe('when passed id does not correspond to any user', () => {
      test('responds with 404 status code', async () => {
        response = await authorizedGetUserLikedReviews(user1.id * -1);
        expect(response.status).toBe(404);
      });
    });

    // user no está logueado
    describe('when request is unauthorized because user is not logged in', () => {
      test('responds with 401 status code', async () => {
        response = await unauthorizedGetUserLikedReviews(user1.id);
        expect(response.status).toBe(401);
      });
    });
  });
});
