const supertest = require('supertest');
const app = require('../../app');

const request = supertest(app.callback());

describe('Admin routes', () => {
  let adminAuth;
  let book1;
  let nonAdminUser1;

  const adminData = {
    username: 'TestAdmin',
    first_name: 'TestFirstName',
    last_name: 'TestLastName',
    is_admin: true,
    email: 'testemail@test.com',
    password: 'encrypted',
  };

  const nonAdminUserData = [{
    username: 'TestUsername1',
    first_name: 'TestFirstName1',
    last_name: 'TestLastName1',
    is_admin: false,
    email: 'nonadmin1@test.com',
    password: 'encrypted',
  },
  {
    username: 'TestUsername2',
    first_name: 'TestFirstName2',
    last_name: 'TestLastName2',
    is_admin: false,
    email: 'nonadmin2@test.com',
    password: 'encrypted',
  }];

  const bookData = [{
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
    nonAdminUser1 = await app.context.orm.User.create(nonAdminUserData[0]);
    await app.context.orm.User.create(nonAdminUserData[1]);
    book1 = await app.context.orm.Book.create(bookData[0]);
    await app.context.orm.Book.create(bookData[1]);
    await app.context.orm.User.create(adminData);
    const authResponse = await request
      .post('/auth')
      .set('Content-type', 'application/json')
      .send({ email: adminData.email, password: adminData.password });
    adminAuth = authResponse.body;
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  // 21. DELETE /admin/books/:book_id: delete book
  describe('DELETE /admin/books/:book_id', () => {
    let response;

    const deleteBook = (bookId) => request
      .delete(`/admin/books/${bookId}`)
      .auth(adminAuth.data.access_token, { type: 'bearer' });

    beforeAll(async () => {
      response = await deleteBook(book1.id);
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
  });

  // 21. DELETE /admin/users/:user_id: delete user
  describe('DELETE /admin/users/user_id', () => {
    let response;

    const deleteUser = (userId) => request
      .delete(`/admin/users/${userId}`)
      .auth(adminAuth.data.access_token, { type: 'bearer' });

    beforeAll(async () => {
      response = await deleteUser(nonAdminUser1.id);
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
  });
});
