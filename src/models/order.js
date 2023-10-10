const {
  STATUS_SUCCESS,
  STATUS_FAIL,
  STATUS_WAITING,
  STATUS_PACKING,
  STATUS_DELIVERY,
  STATUS_CANCEL,
} = require("../config/constant");

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      paymentStatus: {
        type: DataTypes.ENUM(STATUS_SUCCESS, STATUS_FAIL, STATUS_WAITING),
        defaultValue: "waiting",
        allowNull: false,
      },
      orderStatus: {
        type: DataTypes.ENUM(
          STATUS_WAITING,
          STATUS_PACKING,
          STATUS_DELIVERY,
          STATUS_CANCEL
        ),
        defaultValue: "waiting",
        allowNull: false,
      },
    },
    {
      underscored: true,
    }
  );

  Order.associate = (db) => {
    Order.belongsTo(db.Payment, {
      foreignKey: {
        name: "paymentId",
        allowNull: false,
      },
      onDelete: "restrict",
    }),
      Order.belongsTo(db.User, {
        foreignKey: {
          name: "userId",
          allowNull: false,
        },
        onDelete: "restrict",
      }),
      Order.hasMany(db.OrderItem, {
        foreignKey: {
          name: "orderId",
          allowNull: false,
        },
        onDelete: "restrict",
      });
  };

  return Order;
};
