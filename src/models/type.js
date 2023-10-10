const {
  TYPE_RING,
  TYPE_BRACELET,
  TYPE_EARRING,
  TYPE_NECKLACE,
} = require("../config/constant");

module.exports = (sequelize, DataTypes) => {
  const Type = sequelize.define(
    "Type",
    {
      type: {
        type: DataTypes.ENUM(
          TYPE_RING,
          TYPE_BRACELET,
          TYPE_EARRING,
          TYPE_NECKLACE
        ),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      underscored: true,
      timestamps: false,
    }
  );

  Type.associate = (db) => {
    Type.hasMany(db.Product, {
      foreignKey: {
        name: "typeId",
        allowNull: false,
      },
      onDelete: "restrict",
    });
  };

  return Type;
};
