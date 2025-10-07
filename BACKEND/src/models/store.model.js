const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Store = sequelize.define("Store", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        storeName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ownerName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        establishedYear: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        website: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        ownerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        }
    }, {
        tableName: 'stores',
        timestamps: true
    });

    return Store;
};
