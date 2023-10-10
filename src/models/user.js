module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      username: {
        allowNull: false,
        type: DataTypes.STRING(),
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING(),
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      mobile: {
        type: DataTypes.STRING(),
        unique: true,
        allowNull: false,
        validate: {
          is: /^[0-9]{10}$/,
        },
      },
      totalBought: {
        type: DataTypes.INTEGER(),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      underscored: true,
    }
  );

  User.associate = (db) => {
    User.hasMany(db.Address, {
      foreignKey: {
        name: "userId",
        allowNull: false,
      },
      onDelete: "restrict",
    }),
      User.hasOne(db.Membership, {
        foreignKey: {
          name: "userId",
          allowNull: false,
        },
        onDelete: "restrict",
      }),
      User.hasMany(db.Order, {
        foreignKey: {
          name: "userId",
          allowNull: false,
        },
        onDelete: "restrict",
      }),
      User.hasMany(db.Cart, {
        foreignKey: {
          name: "userId",
          allowNull: false,
        },
        onDelete: "restrict",
      });
  };

  return User;
};
