module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    "Payment",
    {
      payment: {
        type: DataTypes.STRING(),
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

  Payment.associate = (db) => {
    Payment.hasMany(db.UserPayment, {
      foreignKey: {
        name: 'paymentId',
        allowNull: false,
      },
      onDelete: 'restrict'
    })
  };

  return Payment;
};
