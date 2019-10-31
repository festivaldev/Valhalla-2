module.exports = (sequelize, DataTypes) => {
    const Response = sequelize.define('Response', {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        deckId: {
            type: DataTypes.STRING(32),
            allowNull: false
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        hooks: {
            beforeCreate: (responseObj, options) => {
                return responseObj;
            }
        }
    });
    return Response;
};