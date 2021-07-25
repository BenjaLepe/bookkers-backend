const orm = require('../models');

module.exports = {
  up: async (queryInterface) => {
    // Reset incremental counter for primary key
    const existingInstances = await queryInterface.sequelize.query('SELECT COUNT(*) FROM "Users"');
    await queryInterface
      .sequelize
      .query(`ALTER SEQUENCE "Users_id_seq" RESTART WITH ${existingInstances[0][0].count + 1}`);
    const users = [
      {
        username: 'benja',
        first_name: 'Benjamín',
        last_name: 'Lepe',
        email: 'balepe@uc.cl',
        password: 'benja123',
        description: 'soy una persona',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        username: 'jose',
        first_name: 'Jose',
        last_name: 'Caraball',
        email: 'jtcaraball@uc.cl',
        password: 'jose123',
        description: 'soy una persona',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        username: 'javi',
        first_name: 'Javiera',
        last_name: 'Rojas',
        email: 'jirojas5@uc.cl',
        password: 'javi123',
        description: 'soy una persona',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        username: 'admin',
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@uc.cl',
        is_admin: true,
        password: 'admin123',
        description: 'soy una administrador',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // id 5
        username: 'jessi',
        first_name: 'Jessica',
        last_name: 'LaDuke',
        email: 'jessi@uc.cl',
        password: 'jessi123',
        description: 'Me encanta la lectura, soy fanática de García Márquez',
        updatedAt: new Date(),
        createdAt: new Date(),
        profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Esther_Bejarano.jpg',
      },
      {
        // id 6
        username: 'eltonsmith',
        first_name: 'Elton',
        last_name: 'Smith',
        email: 'elton@uc.cl',
        password: 'elton123',
        description: 'Disfruto el realismo mágico. Busco recomendaciones en ese género.',
        updatedAt: new Date(),
        createdAt: new Date(),
        profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Jordi_cussa.jpg',
      },
      {
        // id 7
        username: 'antonio34',
        first_name: 'Antonio',
        last_name: 'Vargas',
        email: 'antonio@gmail.com',
        password: 'antonio123',
        description: 'I enjoy reading on my free time. Looking for recomendations in spanish',
        updatedAt: new Date(),
        createdAt: new Date(),
        profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/6/61/James_Rodr%C3%ADguez_%28cropped%29.jpg',
      },
      {
        // id 8
        username: 'joe_scholar',
        first_name: 'Joe',
        last_name: 'Mice',
        email: 'joe_the_scholar@gmail.com',
        password: 'scholarlife420',
        description: 'High School teacher, major in literature.',
        updatedAt: new Date(),
        createdAt: new Date(),
        profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Ricardo-costa.jpg',
      },
      {
        // id 9
        username: 'hector_cali',
        first_name: 'Héctor',
        last_name: 'Vázquez',
        email: 'hector_cumbia4life@gmail.com',
        password: 'abedul598',
        description: 'Adentrándome en el mundo de la lectura.',
        updatedAt: new Date(),
        createdAt: new Date(),
        profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Aleksandar_Vu%C4%8Di%C4%87_2019_%28cropped%29.jpg',
      },
      {
        // id 10
        username: 'cesar_gatito',
        first_name: 'Cesar',
        last_name: 'Valenzuela',
        email: 'cvalenzuela_1994@gmail.com',
        password: 'chiqui_miau3',
        description: 'Partiendo por los clásicos.',
        updatedAt: new Date(),
        createdAt: new Date(),
        profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Gato_Siam%C3%A9s_ojos_azules.JPG',
      },
      {
        // id 11
        username: 'dita_paramore',
        first_name: 'Dita',
        last_name: 'Not Von Teese',
        email: 'dita_aggies@ucdavis.edu',
        password: 'gunrock_ftw4e',
        description: 'Go Aggies! UC Davis Pre-med',
        updatedAt: new Date(),
        createdAt: new Date(),
        profile_picture: 'https://upload.wikimedia.org/wikipedia/en/9/9c/N3218096_36428542_8512.jpg',
      },
    ];
    await orm.User.bulkCreate(users, {});
    // await queryInterface.bulkInsert('Users', users, {});
  },

  down: async (queryInterface) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Users', null, {});
  },
};

// usersArray.push({
//   username: 'benja',
//   first_name: 'Benjamín',
//   last_name: 'Lepe',
//   email: 'balepe@uc.cl',
//   password: 'benja123',
//   updatedAt: new Date(),
//   createdAt: new Date(),
// });
