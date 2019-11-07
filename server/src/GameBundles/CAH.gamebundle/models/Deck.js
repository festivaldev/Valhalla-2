module.exports = (sequelize, DataTypes) => {
    const Deck = sequelize.define('Deck', {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        }
    }, {
        hooks: {
            beforeCreate: (deckObj, options) => {
                return deckObj;
            }
        }
    });
    return Deck;
};