const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      this.belongsTo(models.User);
      this.belongsTo(models.Book);
      this.belongsToMany(models.User, { as: 'likes', through: 'Likes' });
      this.hasMany(models.Report);
    }
  }
  Review.init({
    UserId: DataTypes.INTEGER,
    BookId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    body: DataTypes.STRING,
  }, {
    sequelize,
    defaultScope: {
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    },
    modelName: 'Review',
  });
  return Review;
};
