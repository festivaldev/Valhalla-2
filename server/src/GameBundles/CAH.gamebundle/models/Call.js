module.exports = (sequelize, DataTypes) => {
    const Call = sequelize.define('Call', {
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
            beforeCreate: (callObj, options) => {
                return callObj;
            }
        }
    });
    return Call;
};