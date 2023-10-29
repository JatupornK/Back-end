const { CART_STATUS_DONE, CART_STATUS_UNDONE } = require("../config/constant");

module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define(
    "Cart",
    {
      amount: {
        type: DataTypes.INTEGER(),
        allowNull: false,
      },
      sumPrice: {
        type: DataTypes.INTEGER(),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(CART_STATUS_DONE, CART_STATUS_UNDONE),
        defaultValue: CART_STATUS_UNDONE,
        allowNull: false,
      },
    },
    {
      underscored: true,
    }
  );

  Cart.associate = (db) => {
    Cart.belongsTo(db.Product, {
      foreignKey: {
        name: "productId",
        allowNull: false,
      },
      onDelete: "restrict",
    }),
      Cart.belongsTo(db.Size, {
        foreignKey: {
          name: "sizeId",
          allowNull: false,
        },
        onDelete: "restrict",
      }),
      Cart.belongsTo(db.User, {
        foreignKey: {
          name: "userId",
          allowNull: false,
        },
        onDelete: "restrict",
      }),
      Cart.hasMany(db.OrderItem, {
        foreignKey: {
          name: "cartId",
          allowNull: false,
        },
        onDelete: "restrict",
      });
  };

  return Cart;
};
