const supertest = require('supertest');
const app = require('../../app');

const request = supertest(app.callback());

describe('Book routes', () => {
  let auth;
  let authNonAdmin;
  let nonAdminUser;
  let adminUser;
  let book1;
  let book2;
  const userFields = {
    username: 'TestUsername',
    first_name: 'TestFirstName',
    last_name: 'TestLastName',
    is_admin: true,
    email: 'testemail@test.com',
    password: 'encrypted',
  };

  const nonAdminFields = {
    username: 'TestUsername2',
    first_name: 'TestFirstName2',
    last_name: 'TestLastName2',
    is_admin: false,
    email: 'nonadmin@test.com',
    password: 'encrypted',
  };

  const bookFields = [{
    name: 'TestBook',
    ISBN: '123-4-56-78910-0',
    editorial: 'TestEditorial',
    pages_number: 123,
    author: 'TestAuthor',
    genre: 'TestGenre',
  },
  {
    name: 'TestBook2',
    author: 'TestAuth2',
    ISBN: '123-4-56-78910-1',
    editorial: 'TestEditorial2',
    pages_number: 123,
    genre: 'TestGenre2',
  }];

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
    adminUser = await app.context.orm.User.create(userFields);
    nonAdminUser = await app.context.orm.User.build(nonAdminFields);
    await nonAdminUser.save();
    // await app.context.orm.User.create(nonAdminFields);
    book1 = await app.context.orm.Book.create(bookFields[0]);
    book2 = await app.context.orm.Book.build(bookFields[1]);
    await book2.save();
    const authResponse = await request
      .post('/auth')
      .set('Content-type', 'application/json')
      .send({ email: userFields.email, password: userFields.password });
    auth = authResponse.body;
    const nonAdminauthResponse = await request
      .post('/auth')
      .set('Content-type', 'application/json')
      .send({ email: nonAdminFields.email, password: nonAdminFields.password });
    authNonAdmin = nonAdminauthResponse.body;
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });
  // 10. obtener colección de reseñas de un libro
  describe('GET /books/:book_id/reviews', () => {
    let review;
    let response;
    const reviewFields = {
      UserId: 1,
      BookId: 1,
      title: 'TestTitle',
      body: 'TestBody',
    };

    const getReviews = (bookId) => request
      .get(`/books/${bookId}/reviews`)
      .set('Content-type', 'application/json')
      .auth(authNonAdmin.data.access_token, { type: 'bearer' });

    beforeAll(async () => {
      review = await app.context.orm.Review.create(reviewFields);
    });

    afterAll(async () => {
      await review.destroy();
    });

    describe('when passed id corresponds to existing book', () => {
      beforeAll(async () => {
        response = await getReviews(review.BookId);
      });

      test('response code is 200', () => {
        expect(response.status).toBe(200);
      });

      test('response type is json', () => {
        expect(response.type).toEqual('application/json');
      });

      test('response body matches snapshot', () => {
        expect(response.body).toMatchSnapshot();
      });
    });
  });
  // 11. crear reseña de un libro (solo usuario logueado)
  describe('POST /books/:book_id/reviews', () => {
    let requestBody;
    let reviewFields;

    const postReview = (bookId, body) => request
      .post(`/books/${bookId}/reviews`)
      .auth(authNonAdmin.data.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(body);

    beforeAll(async () => {
      reviewFields = {
        UserId: await nonAdminUser.id,
        BookId: await book2.id,
        title: 'TestTitle2',
        body: 'TestBody2',
      };

      requestBody = {
        title: reviewFields.title,
        body: reviewFields.body,
      };
    });

    describe('review is valid and request has valid token', () => {
      let response;
      let review;

      beforeAll(async () => {
        response = await postReview(book2.id, requestBody);
      });

      afterAll(async () => {
        await review.destroy();
      });

      test('response code is 201', () => {
        expect(response.status).toBe(201);
      });

      test('response type is json', () => {
        expect(response.type).toEqual('application/json');
      });

      test('reponse review has id', () => {
        expect(response.body.data.id).toBeDefined();
      });

      test('response body matches snapshot', () => {
        expect(response.body).toMatchSnapshot();
      });

      test('post request created review', async () => {
        review = await app.context.orm.Review.findByPk(response.body.data.id);
        const {
          UserId,
          BookId,
          title,
          body,
        } = review.dataValues;
        const sanitizeData = {
          UserId,
          BookId,
          title,
          body,
        };
        expect(sanitizeData).toEqual(reviewFields);
      });
    });
  });

  // 9. PATCH /books/:book_id: editar la información de un libro.
  describe('PATCH /books/:book_id', () => {
    let response;
    const bookData = {
      name: '1983',
    };

    const authorizedPatchBook = (id) => request
      .patch(`/books/${id}`)
      .auth(auth.data.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(bookData);

    const nonAuthorizedPatchBook = (id) => request
      .patch(`/books/${id}`)
      .auth(authNonAdmin.data.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(bookData);

    describe('User is not an admin', () => {
      beforeAll(async () => {
        response = await nonAuthorizedPatchBook(book2.id);
      });
      test('responds with 403 status code', () => {
        expect(response.status).toBe(403);
      });
      test('responds with a json body type', () => {
        expect(response.type).toEqual('application/json');
      });
      test('body matches snapshot', () => {
        expect(response.body).toMatchSnapshot();
      });
    });

    describe('User is an admin', () => {
      beforeAll(async () => {
        response = await authorizedPatchBook(book2.id);
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
  });
  // 12. obtener detalle de una reseña
  describe('GET /books/:book_id/reviews/:review_id', () => {
    let review;
    let response;
    const reviewFields = {
      UserId: 1,
      BookId: 1,
      title: 'TestTitle',
      body: 'TestBody',
    };
    const getReview = (bookId, reviewId) => request
      .get(`/books/${bookId}/reviews/${reviewId}`)
      .auth(authNonAdmin.data.access_token, { type: 'bearer' });

    beforeAll(async () => {
      review = await app.context.orm.Review.create(reviewFields);
    });

    afterAll(async () => {
      await review.destroy();
    });

    describe('when passed book_id and review_id are in database', () => {
      beforeAll(async () => {
        response = await getReview(review.BookId, review.id);
      });

      test('response code is 200', () => {
        expect(response.status).toBe(200);
      });

      test('response type is json', () => {
        expect(response.type).toEqual('application/json');
      });

      test('response body matches snapshot', () => {
        expect(response.body).toMatchSnapshot();
      });
    });
  });
  // 13. editar reseña de un libro
  describe('PATCH /books/:book_id/reviews/:review_id', () => {
    let reviewOne;
    let reviewTwo;
    let response;
    let reviewFieldsOne;
    let reviewFieldsTwo;

    const newReviewData = {
      title: 'newTitle',
      body: 'newBody',
    };
    const adminPatchReview = (bookId, id) => request
      .patch(`/books/${bookId}/reviews/${id}`)
      .auth(auth.data.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(newReviewData);

    const ownerPatchReview = (bookId, id) => request
      .patch(`/books/${bookId}/reviews/${id}`)
      .auth(authNonAdmin.data.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(newReviewData);

    beforeAll(async () => {
      reviewFieldsOne = {
        UserId: await nonAdminUser.id,
        BookId: 1,
        title: 'TestTitle',
        body: 'TestBody',
      };
      reviewFieldsTwo = {
        UserId: await adminUser.id,
        BookId: 2,
        title: 'TestTitle2',
        body: 'TestBody2',
      };
      reviewOne = await app.context.orm.Review.create(reviewFieldsOne);
      reviewTwo = await app.context.orm.Review.create(reviewFieldsTwo);
    });

    afterAll(async () => {
      await reviewOne.destroy();
      await reviewTwo.destroy();
    });

    describe('User requests to modify own review', () => {
      beforeAll(async () => {
        response = await ownerPatchReview(reviewOne.BookId, reviewOne.id);
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

    describe('Admin requests to modify review', () => {
      beforeAll(async () => {
        response = await adminPatchReview(reviewTwo.BookId, reviewTwo.id);
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
  });
  // 6. obtener colección de libros
  describe('GET /books', () => {
    let response;
    const getBooks = () => request
      .get('/books')
      .auth(authNonAdmin.data.access_token, { type: 'bearer' });

    beforeAll(async () => {
      response = await getBooks();
    });

    test('responds with 200 status code', async () => {
      expect(response.status).toBe(200);
    });

    test('responds with json body', async () => {
      expect(response.type).toBe('application/json');
    });

    test('body match snapshot', async () => {
      expect(response.body).toMatchSnapshot();
    });
  });

  // 17. DELETE /books/:book_id/reviews/:review_id
  describe('DELETE /books/:book_id/reviews/:review_id', () => {
    let response;
    let reviewFields;
    let reviewOne;
    let reviewTwo;
    let reviewThree;

    const ownerDeleteReview = (bookId, reviewId) => request
      .delete(`/books/${bookId}/reviews/${reviewId}`)
      .auth(authNonAdmin.data.access_token, { type: 'bearer' });

    const adminDeleteReview = (bookId, reviewId) => request
      .delete(`/books/${bookId}/reviews/${reviewId}`)
      .auth(auth.data.access_token, { type: 'bearer' });

    beforeAll(async () => {
      reviewFields = [{
        UserId: await nonAdminUser.id,
        BookId: await book1.id,
        title: 'TestTitle1',
        body: 'TestBody1',
      },
      {
        UserId: await adminUser.id,
        BookId: await book1.id,
        title: 'TestTitle2',
        body: 'TestBody2',
      },
      {
        UserId: await nonAdminUser.id,
        BookId: await book1.id,
        title: 'TestTitle3',
        body: 'TestBody3',
      }];
      reviewOne = await app.context.orm.Review.create(reviewFields[0]);
      reviewTwo = await app.context.orm.Review.create(reviewFields[1]);
      reviewThree = await app.context.orm.Review.create(reviewFields[2]);
    });

    afterAll(async () => {
      await reviewOne.destroy();
      await reviewTwo.destroy();
      await reviewThree.destroy();
    });

    describe('User request to delete own review', () => {
      beforeAll(async () => {
        response = await ownerDeleteReview(reviewOne.BookId, reviewOne.id);
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

    describe('Admin request to delete other users review', () => {
      beforeAll(async () => {
        response = await adminDeleteReview(reviewThree.BookId, reviewThree.id);
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
  // 19. POST /books/:book_id/reviews/:review_id/reports
  describe('POST /books/:book_id/reviews/:review_id/reports', () => {
    let requestBody;
    let review;
    let reviewFields;
    let reportFields;

    const postReport = (bookId, reviewId, body) => request
      .post(`/books/${bookId}/reviews/${reviewId}/reports`)
      .auth(authNonAdmin.data.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(body);

    beforeAll(async () => {
      reviewFields = {
        UserId: await adminUser.id,
        BookId: await book1.id,
        title: 'TestTitle1',
        body: 'TestBody1',
      };
      review = await app.context.orm.Review.create(reviewFields);

      reportFields = {
        UserId: nonAdminUser.id,
        ReviewId: review.id,
        comment: 'TestComment1',
      };
      requestBody = {
        comment: reportFields.comment,
      };
    });

    afterAll(async () => {
      await review.destroy();
    });

    describe('report is valid and request has valid token', () => {
      let response;
      let report;

      beforeAll(async () => {
        response = await postReport(
          book1.id,
          reportFields.ReviewId,
          requestBody,
        );
      });

      test('response code is 201', () => {
        expect(response.status).toBe(201);
      });

      test('response type is json', () => {
        expect(response.type).toEqual('application/json');
      });

      test('response report has id', () => {
        expect(response.body.data.id).toBeDefined();
      });

      test('response body matches snapshot', () => {
        expect(response.body).toMatchSnapshot();
      });

      test('post request created report', async () => {
        report = await app.context.orm.Report.findByPk(response.body.data.id);
        const { UserId, ReviewId, comment } = report.dataValues;
        const sanitizeData = { UserId, ReviewId, comment };
        expect(sanitizeData).toEqual(reportFields);
      });
    });
  });

  // 20. GET /books/:book_id/reviews/:review_id/reports
  describe('GET /books/:book_id/reviews/:review_id/reports', () => {
    let reviewFields;
    let review;
    let reportFields;

    const getReports = (bookId, reviewId) => request
      .get(`/books/${bookId}/reviews/${reviewId}/reports`)
      .auth(auth.data.access_token, { type: 'bearer' });

    beforeAll(async () => {
      reviewFields = {
        UserId: await adminUser.id,
        BookId: await book1.id,
        title: 'TestTitle1',
        body: 'TestBody1',
      };
      review = await app.context.orm.Review.create(reviewFields);

      reportFields = [{
        UserId: nonAdminUser.id,
        ReviewId: review.id,
        comment: 'TestComment1',
      },
      {
        UserId: adminUser.id,
        ReviewId: review.id,
        comment: 'TestComment2',
      }];
      await app.context.orm.Report.create(reportFields[0]);
      await app.context.orm.Report.create(reportFields[1]);
    });

    afterAll(async () => {
      await review.destroy();
    });

    describe('request has admin auth token', () => {
      let response;

      beforeAll(async () => {
        response = await getReports(book1.id, review.id);
      });

      test('response code is 200', () => {
        expect(response.status).toBe(200);
      });

      test('response type is json', () => {
        expect(response.type).toEqual('application/json');
      });

      test('response body matches snapshot', () => {
        expect(response.body).toMatchSnapshot();
      });
    });
  });
});
