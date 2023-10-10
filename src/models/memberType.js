const { MEMBER_NORMAL, MEMBER_EXCLUSIVE } = require("../config/constant");

module.exports = (sequelize, DataTypes) => {
  const MemberType = sequelize.define(
    "MemberType",
    {
      memberType: {
        type: DataTypes.ENUM(MEMBER_NORMAL, MEMBER_EXCLUSIVE),
        allowNull: false,
      },
    },
    {
      underscored: true,
      timestamps: false,
    }
  );

  MemberType.associate = (db) => {
    MemberType.hasMany(db.Membership, {
      foreignKey: {
        name: "memberTypeId",
        allowNull: false,
      },
      onDelete: "restrict",
    });
  };

  return MemberType;
};
