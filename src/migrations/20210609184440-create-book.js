module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Books',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        name: {
          type: Sequelize.STRING,
        },
        image: {
          type: Sequelize.STRING,
        },
        ISBN: {
          type: Sequelize.STRING,
          unique: true,
          allowNull: false,
        },
        editorial: {
          type: Sequelize.STRING,
        },
        genre: {
          type: Sequelize.STRING,
        },
        author: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        pages_number: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Books');
  },
};
