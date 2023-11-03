module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define(
    "Address",
    {
      addressTitle: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      postCode: {
        type: DataTypes.STRING(5),
        allowNull: false,
      },
      lastest: {
        type: DataTypes.BOOLEAN(),
        defaultValue: true,
      },
      phoneNumber: {
        type: DataTypes.STRING(10),
        allowNull:false
      }
    },
    {
      underscored: true,
    }
  );

  Address.associate = (db) => {
    Address.belongsTo(db.User, {
      foreignKey: {
        name: "userId",
        allowNull: false,
      },
      onDelete: "restrict",
    });
  };

  return Address;
};
