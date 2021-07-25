require('dotenv').config();
const { Model } = require('sequelize');

const bcrypt = require('bcrypt');

const PASSWORD_SALT_ROUNDS = process.env.PASSWORD_SALT_ROUNDS || 10;

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // this.belongsToMany(models.Book, { as: 'review', through: models.Review });
      this.belongsToMany(models.Review, { as: 'likes', through: 'Likes' });
      this.hasMany(models.Review, { as: 'MyReviews' });
      this.hasMany(models.Report);
    }

    // Check password middleware
    async checkPassword(password) {
      const iscorrectPassword = await bcrypt.compare(password, this.password);
      return iscorrectPassword;
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El campo Username no puede estar vacio',
        },
      },
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El campo "Nombre" no puede estar vacio',
        },
      },
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'El email debe seguir el siguiente formato: xxxx@xxx.xx',
        },
      },

    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [6, 150],
          msg: 'El largo del password debe ser entre 6 y 30 caracteres',
        },
      },
    },
    profile_picture: {
      type: DataTypes.STRING,
      defaultValue: 'https://www.pavilionweb.com/wp-content/uploads/2017/03/man-300x300.png',
    },
    description: DataTypes.STRING,
  }, {
    sequelize,
    defaultScope: {
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
    },
    scopes: {
      withPassword: {
        attributes: {},
      },
    },
    modelName: 'User',
  });

  User.beforeSave(async (instance) => {
    if (instance.changed('password')) {
      const hash = await bcrypt.hash(instance.password, PASSWORD_SALT_ROUNDS);
      instance.set('password', hash);
    }
  });

  User.beforeBulkCreate(async (users) => {
    await Promise.all(users.map(async (user) => {
      const pswEncrypted = await bcrypt.hash(user.password, PASSWORD_SALT_ROUNDS);
      user.set('password', pswEncrypted);
      return user;
    }));
  });

  return User;
};
