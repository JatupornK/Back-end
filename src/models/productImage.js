module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define(
    "Image",
    {
      image: {
        type: DataTypes.STRING(),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          isUrl: true,
        },
      },
    },
    {
      underscored: true,
      timestamps: false,
    }
  );

  Image.associate = (db) => {
    Image.belongsTo(db.Priority, {
      foreignKey: {
        name: "priorityId",
        allowNull: false,
      },
      onDelete: "restrict",
    }),
      Image.belongsTo(db.Product, {
        foreignKey: {
          name: "productId",
          allowNull: false,
        },
        onDelete: "restrict",
      });
  };

  return Image;
};
