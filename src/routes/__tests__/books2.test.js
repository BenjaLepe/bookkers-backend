const supertest = require('supertest');
// const { format } = require('date-fns');
const app = require('../../app');

const request = supertest(app.callback());

describe('Book API routes', () => {
  // contiene token
  let auth;
  let authUser;
  // crear usuario
  const userFields = {
    username: 'username_books',
    first_name: 'name1',
    last_name: 'lastname1',
    email: 'email_books@uc.cl',
    password: 'test123',
    description: 'soy una persona',
  };

  beforeAll(async () => {
    // sincronizar base de datos
    await app.context.orm.sequelize.sync({ force: true });

    // crear usuario en db
    authUser = await app.context.orm.User.build(userFields);
    await authUser.save();

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
  // 8. GET /books/:book_id: obtener detalle de un libro
  describe('GET /books/:book_id', () => {
    let book;
    let response;
    const bookData = {
      name: 'TestBook_',
      ISBN: '123-4-56-78910-7',
      editorial: 'TestEditorial',
      pages_number: 123,
      author: 'TestAuthor',
      genre: 'TestGenre',
    };
    const authorizedGetBook = (id) => request
      .get(`/books/${id}`)
      .auth(auth.data.access_token, { type: 'bearer' });

    const unauthorizedGetBook = (id) => request.get(`/books/${id}`);

    beforeAll(async () => {
      book = await app.context.orm.Book.create(bookData);
    });

    // id que se la pasa a la ruta existe en la base de datos y esta logueado
    describe('when passed id corresponds to an existing book', () => {
      beforeAll(async () => {
        response = await authorizedGetBook(book.id);
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
    // id que se le pasa a la ruta no corresponde a algun book en db y esta logueado
    describe('when passed id does not correspond to any book', () => {
      test('responds with 404 status code', async () => {
        response = await authorizedGetBook(book.id * -1);
        expect(response.status).toBe(404);
      });
    });

    // user no está logueado
    describe('when request is unauthorized because user is not logged in', () => {
      test('responds with 401 status code', async () => {
        response = await unauthorizedGetBook(book.id);
        expect(response.status).toBe(401);
      });
    });
  });
  // 7. POST /books, crear un libro con un ISBN único
  describe('POST /books', () => {
    let response;
    const bookData = {
      name: 'TestBook8',
      ISBN: '123-4-56-78910-8',
      editorial: 'TestEditorial2',
      pages_number: 1234,
      author: 'TestAuthor2',
      genre: 'TestGenre2',
    };
    const PostBook = () => request
      .post('/books')
      .set('Content-type', 'application/json')
      .auth(auth.data.access_token, { type: 'bearer' })
      .send(bookData);

    afterAll(async () => {
      const createdBook = await app.context.orm.User.findOne({
        where: { ISBN: bookData.ISBN },
      });
      await createdBook.destroy();
    });

    // la información ingresada para registrarse es válida
    describe('book data is valid', () => {
      beforeAll(async () => {
        response = await PostBook();
      });
      test('responds with 201 status code', () => {
        expect(response.status).toBe(201);
      });
      test('responds with a json body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('body matches snapshot', () => {
        expect(response.body).toMatchSnapshot();
      });
    });
  });
  // 3. secundaria (16) POST likes
  describe('POST /books/:book_id/reviews/:review_id/likes', () => {
    let response;
    let book;
    let review;
    const bookData = {
      name: 'TestBook8',
      ISBN: '123-4-56-78910-8',
      editorial: 'TestEditorial2',
      pages_number: 1234,
      author: 'TestAuthor2',
      genre: 'TestGenre2',
    };
    const authorizedPostLike = (bookId, reviewId) => request
      .post(`/books/${bookId}/reviews/${reviewId}/likes`)
      .set('Content-type', 'application/json')
      .auth(auth.data.access_token, { type: 'bearer' });

    beforeAll(async () => {
      // user = await app.context.orm.User.create(userData);
      book = await app.context.orm.Book.create(bookData);
      const reviewData = {
        UserId: authUser.id,
        BookId: book.id,
        title: 'TestTitle',
        body: 'TestBody',
      };
      review = await app.context.orm.Review.create(reviewData);
    });

    afterAll(async () => {
      await authUser.removeLike(review);
      await review.destroy();
      await book.destroy();
    });

    // la información ingresada para registrarse es válida
    describe('user is auth, book and review id are valid', () => {
      let isLiked;
      beforeAll(async () => {
        response = await authorizedPostLike(review.BookId, review.id);
        await review.update();
        await authUser.update();
        isLiked = await authUser.hasLike(review);
      });
      test('responds with 201 status code', () => {
        expect(response.status).toBe(201);
      });
      test('responds with a json body type', () => {
        expect(response.type).toEqual('application/json');
      });
      test('response for POST like contains an id', () => {
        expect(response.body.data.id).toBeDefined();
      });

      test('body matches snapshot', () => {
        expect(response.body).toMatchSnapshot();
      });
      test('post request actually created the given like', async () => {
        expect(isLiked).toEqual(true);
      });
    });
  });

  // 4. secundaria (17) DELETE like
  describe('DELETE /books/:book_id/reviews/:review_id/likes', () => {
    let response;
    let book;
    let review;
    const bookData = {
      name: 'TestBook8',
      ISBN: '123-4-56-78910-8',
      editorial: 'TestEditorial2',
      pages_number: 1234,
      author: 'TestAuthor2',
      genre: 'TestGenre2',
    };
    const authorizedDeleteLike = (bookId, reviewId) => request
      .delete(`/books/${bookId}/reviews/${reviewId}/likes`)
      .set('Content-type', 'application/json')
      .auth(auth.data.access_token, { type: 'bearer' });

    beforeAll(async () => {
      book = await app.context.orm.Book.create(bookData);
      const reviewData = {
        UserId: authUser.id,
        BookId: book.id,
        title: 'TestTitle',
        body: 'TestBody',
      };
      review = await app.context.orm.Review.create(reviewData);
      await authUser.addLike(review);
    });

    afterAll(async () => {
      await review.destroy();
      await book.destroy();
    });
    describe('user is auth, has liked this review before, book and review id are valid', () => {
      let isLiked;

      beforeAll(async () => {
        response = await authorizedDeleteLike(review.BookId, review.id);
        await review.update();
        await authUser.update();
        isLiked = await authUser.hasLike(review);
      });

      test('responds with 200 status code', async () => {
        expect(response.status).toBe(200);
      });

      test('responds with json body', async () => {
        expect(response.type).toEqual('application/json');
      });

      test('body match snapshot', async () => {
        expect(response.body).toMatchSnapshot();
      });
      test('like was actually deleted', async () => {
        expect(isLiked).toEqual(false);
      });
    });
  });
});
