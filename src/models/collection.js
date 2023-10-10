module.exports = (sequelize, DataTypes) => {
  const Collection = sequelize.define(
    "Collection",
    {
      collection: {
        type: DataTypes.STRING(),
        allowNull: false,
        unique: true,
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

  Collection.associate = (db) => {
    Collection.hasMany(db.Product, {
      foreignKey: {
        name: "collectionId",
      },
      onDelete: "restrict",
    });
  };

  return Collection;
};
