module.exports = (sequelize, DataTypes) => {
  const ProductSize = sequelize.define(
    "ProductSize",
    {},
    {
      underscored: true,
      timestamps: false,
    }
  );

  ProductSize.associate = (db) => {
    ProductSize.belongsTo(db.Size, {
      foreignKey: {
        name: "sizeId",
        allowNull: false,
      },
      onDelete: "restrict",
    }),
      ProductSize.belongsTo(db.Product, {
        foreignKey: {
          name: "productId",
          allowNull: false,
        },
        onDelete: "restrict",
      });
  };

  return ProductSize;
};
