module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Likes',
      {
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        UserId: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          onDelete: 'CASCADE',
          references: {
            model: 'Users',
            key: 'id',
          },
        },
        ReviewId: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          onDelete: 'CASCADE',
          references: {
            model: 'Reviews',
            key: 'id',
          },
        },
      });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Likes');
  },
};
