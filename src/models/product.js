module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      name: {
        type: DataTypes.STRING(),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      price: {
        type: DataTypes.INTEGER(),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      description: {
        type: DataTypes.STRING(),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      bestSeller: {
        type: DataTypes.BOOLEAN(),
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      underscored: true,
    }
  );

  Product.associate = (db) => {
    Product.hasMany(db.Image, {
      foreignKey: {
        name: "productId",
        allowNull: false,
      },
      onDelete: "restrict",
    }),
      Product.hasMany(db.ProductSize, {
        foreignKey: {
          name: "productId",
          allowNull: false,
        },
        onDelete: "restrict",
      }),
      Product.belongsTo(db.Type, {
        foreignKey: {
          name: "typeId",
          allowNull: false,
        },
        onDelete: "restrict",
      }),
      Product.belongsTo(db.Collection, {
        foreignKey: {
          name: "collectionId",
        },
        onDelete: "restrict",
      }),
      Product.hasMany(db.Cart, {
        foreignKey: {
          name: "productId",
          allowNull: false,
        },
        onDelete: "restrict",
      });
  };

  return Product;
};
