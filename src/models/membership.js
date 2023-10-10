module.exports = (sequelize, DataTypes) => {
  const Membership = sequelize.define(
    "Membership",
    {
      startedAt: {
        type: DataTypes.DATEONLY(),
        validate: {
          isDate: true,
        },
      },
      expiredIn: {
        type: DataTypes.DATEONLY(),
        validate: {
          isDate: true,
        },
      },
    },
    {
      underscored: true,
      timestamps: false,
    }
  );

  Membership.associate = (db) => {
    Membership.belongsTo(db.MemberType, {
      foreignKey: {
        name: "memberTypeId",
      },
      onDelete: "restrict",
      defaultValue: '1',
    }),
      Membership.belongsTo(db.User, {
        foreignKey: {
          name: "userId",
          allowNull: false,
        },
        onDelete: "restrict",
      });
  };

  return Membership;
};
