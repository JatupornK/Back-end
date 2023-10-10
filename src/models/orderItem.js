module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define(
    "OrderItem",
    {},
    {
      underscored: true,
      timestamps: false,
    }
  );

  OrderItem.associate = (db) => {
    OrderItem.belongsTo(db.Cart, {
      foreignKey: {
        name: "cartId",
        allowNull: false,
      },
      onDelete: "restrict",
    }),
      OrderItem.belongsTo(db.Order, {
        foreignKey: {
          name: "orderId",
          allowNull: false,
        },
        onDelete: "restrict",
      });
  };

  return OrderItem;
};
