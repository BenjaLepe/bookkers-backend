const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      /* Reseñas entre usuarios y libros */
      // this.belongsToMany(models.User, { as: 'review', through: models.Review });
      this.hasMany(models.Review);
    }
  }
  Book.init({
    name: DataTypes.STRING,
    ISBN: DataTypes.STRING,
    editorial: DataTypes.STRING,
    pages_number: DataTypes.INTEGER,
    author: DataTypes.STRING,
    genre: DataTypes.STRING,
    image: {
      type: DataTypes.STRING,
      defaultValue: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1200px-No-Image-Placeholder.svg.png',
    },
  }, {
    sequelize,
    defaultScope: {
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    },
    modelName: 'Book',
  });
  return Book;
};
