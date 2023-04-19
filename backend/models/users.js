const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcrypt");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    middleName: {
      type: DataTypes.STRING,
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    companyName: {
      type: DataTypes.STRING,
    },
    position: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    educationLevel: {
      type: DataTypes.ENUM("BAC", "BAC+3", "BAC+5"),
      allowNull: false,
    },
    taxCategory: {
      type: DataTypes.ENUM("financier", "non financier", "etatique"),
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(value, salt);
        this.setDataValue("password", hashedPassword);
      },
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeValidate: (user, options) => {
        // Vérification et nettoyage des données
        user.email = user.email.toLowerCase().trim();
        user.firstName = user.firstName.trim();
        user.lastName = user.lastName.trim();
        if (user.middleName) {
          user.middleName = user.middleName.trim();
        }
      },
    },
  }
);

User.prototype.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = User;
