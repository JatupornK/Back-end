module.exports = (sequelize, DataTypes) => {
  const UserPayment = sequelize.define(
    "UserPayment",
    {
      stripePaymentId: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      lastest: {
        type: DataTypes.BOOLEAN(),
        defaultValue: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN(),
        defaultValue: false
      }
    },
    {
      underscored: true,
    }
  );

  UserPayment.associate = (db) => {
    UserPayment.belongsTo(db.User, {
      foreignKey: {
        name: "userId",
        allowNull: false,
      },
      onDelete: "restrict",
    });
    UserPayment.belongsTo(db.Payment, {
      foreignKey: {
        name: "paymentId",
        allowNull: false,
      },
      onDelete: "restrict",
    });
    UserPayment.hasMany(db.Order, {
      foreignKey: {
        name: "userPaymentId",
        allowNull: false,
      },
      onDelete: "restrict",
    });
  };

  return UserPayment;
};
