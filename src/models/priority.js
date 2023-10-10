const {
  PRIORITY_FIRST,
  PRIORITY_SECOND,
  PRIORITY_NORMAL,
} = require("../config/constant");

module.exports = (sequelize, DataTypes) => {
  const Priority = sequelize.define(
    "Priority",
    {
      priority: {
        type: DataTypes.ENUM(PRIORITY_FIRST, PRIORITY_SECOND, PRIORITY_NORMAL),
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

  Priority.associate = (db) => {
    Priority.hasMany(db.Image, {
      foreignKey: {
        name: "priorityId",
        allowNull: false,
      },
      onDelete: "restrict",
    });
  };

  return Priority;
};
