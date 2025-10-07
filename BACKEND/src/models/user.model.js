const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        fullName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Normal User",
            validate: {
                isIn: {
                    args: [["Admin", "Normal User", "Owner"]],
                    msg: "Invalid role",
                },
            },
        }
    });
    return User;
};