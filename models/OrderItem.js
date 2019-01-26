const Sequelize = require('sequelize');

sequelize = require('../util/database');
/*
    Each cart item is essentially a combination of a product and and the ID of the cart
    in which this prdouct lies.
*/
const OrderItem = sequelize.define('orderItem', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },

    quantity: Sequelize.INTEGER
});

module.exports = OrderItem;