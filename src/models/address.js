module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define(
    "Address",
    {
      houseNumber: {
        type: DataTypes.STRING(),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      province: {
        type: DataTypes.STRING(),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      district: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      subDistrict: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      postCode: {
        type: DataTypes.STRING(),
        allowNull: false,
        validate: {
          isInt: true,
        },
      },
      latest: {
        type: DataTypes.BOOLEAN(),
        defaultValue: true,
      },
    },
    {
      underscored: true,
      timestamps: false,
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
