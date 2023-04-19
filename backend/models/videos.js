const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Video = sequelize.define(
  "Video",
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
    // Ajoutez les autres champs requis pour les vidéos ici
  },
  {
    timestamps: true,
  }
);

module.exports = Video;
