module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      firstName: {
        allowNull: false,
        type: DataTypes.STRING(),
        validate: {
          notEmpty: true,
        }
      },
      lastName: {
        allowNull: false,
        type: DataTypes.STRING(),
        validate: {
          notEmpty: true
        }
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING(),
        allowNull:false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      mobile: {
        type: DataTypes.STRING(),
        allowNull:false,
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
