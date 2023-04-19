const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Lesson = sequelize.define(
  "Lesson",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Ajoutez les autres champs requis pour les leçons ici
  },
  {
    timestamps: true,
  }
);

module.exports = Lesson;
