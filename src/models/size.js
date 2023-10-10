module.exports = (sequelize, DataTypes) => {
  const Size = sequelize.define(
    "Size",
    {
      size: {
        type: DataTypes.STRING(),
        allowNull: false,
        unique: true,
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

  Size.associate = (db) => {
    Size.hasMany(db.ProductSize, {
      foreignKey: {
        name: "sizeId",
        allowNull: false,
      },
      onDelete: "restrict",
    }),
      Size.hasMany(db.Cart, {
        foreignKey: {
          name: "sizeId",
          allowNull: false,
        },
        onDelete: "restrict",
      });
  };

  return Size;
};
