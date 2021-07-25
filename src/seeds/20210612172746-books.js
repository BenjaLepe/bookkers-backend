module.exports = {
  up: async (queryInterface) => {
    // Reset incremental counter for primary key
    const existingInstances = await queryInterface.sequelize.query('SELECT COUNT(*) FROM "Books"');
    await queryInterface
      .sequelize
      .query(`ALTER SEQUENCE "Books_id_seq" RESTART WITH ${existingInstances[0][0].count + 1}`);
    const books = [
      {
        name: '1984',
        author: 'George Orwell',
        ISBN: '9780436350221',
        editorial: 'Debolsillo',
        pages_number: 328,
        genre: 'Sci-Fi',
        updatedAt: new Date(),
        createdAt: new Date(),
        image: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/1984first.jpg',
      },
      {
        name: '100 años de soledad',
        author: 'Gabriel García Márquez',
        ISBN: '9780065023961',
        editorial: 'Państwowy Instytut Wydawniczy',
        pages_number: 471,
        genre: 'Novel',
        updatedAt: new Date(),
        createdAt: new Date(),
        image: 'https://upload.wikimedia.org/wikipedia/en/a/a0/Cien_a%C3%B1os_de_soledad_%28book_cover%2C_1967%29.jpg',
      },
      {
        name: 'Paula',
        author: 'Isabel Allende',
        ISBN: '9780060172534',
        editorial: 'Plaza & Janés',
        pages_number: 366,
        genre: 'Novel',
        updatedAt: new Date(),
        createdAt: new Date(),
        image: 'https://upload.wikimedia.org/wikipedia/en/e/e2/Paula_Isabel_Allende.jpg',
      },
      {
        // id 4
        name: 'Don Quijote de la Mancha',
        author: 'Miguel de Cervantes',
        ISBN: '9788817107938',
        editorial: 'Francisco de Robles',
        pages_number: 1327,
        genre: 'Novela de aventuras',
        updatedAt: new Date(),
        createdAt: new Date(),
        image: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Miguel_de_Cervantes_%281605%29_El_ingenioso_hidalgo_Don_Quixote_de_la_Mancha.png',
      },
      {
        name: 'Crónicas marcianas',
        author: 'Ray Bradbury',
        ISBN: '9780062079930',
        editorial: 'Minotauro',
        pages_number: 288,
        genre: 'Novel',
        updatedAt: new Date(),
        createdAt: new Date(),
        image: 'https://upload.wikimedia.org/wikipedia/en/4/45/The-Martian-Chronicles.jpg',
      },
      {
        // id 6
        name: 'Fahrenheit 451',
        author: 'Ray Bradbury',
        ISBN: '',
        editorial: 'Ballantine Books',
        pages_number: 1,
        genre: 'Novel',
        updatedAt: new Date(),
        createdAt: new Date(),
        image: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Fahrenheit451HUNcover.jpg',
      },
      {
        // id 7
        name: 'Narraciones extraordinarias',
        author: 'Edgar Allan Poe',
        ISBN: '9789561230460',
        editorial: 'Zig Zag',
        pages_number: 392,
        genre: 'Recopilación de cuentos de terror',
        updatedAt: new Date(),
        createdAt: new Date(),
        image: 'https://upload.wikimedia.org/wikipedia/commons/3/31/PitandthePendulum-Clarke.jpg',
      },
      {
        // id 8
        name: 'Mitos de Cthulhu',
        author: 'Howard Phillips Lovecraft',
        ISBN: '978-84-945791-2-7',
        editorial: 'Biblok',
        pages_number: 1,
        genre: 'Cuentos de Terror',
        updatedAt: new Date(),
        createdAt: new Date(),
        image: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Cthulhu_and_R%27lyeh.jpg',
      },
    ];
    await queryInterface.bulkInsert('Books', books, {});
  },

  down: async (queryInterface) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Books', null, {});
  },
};
