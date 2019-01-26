const Sequelize = require('sequelize');

sequelize = require('../util/database');
/*
    An Order is an in between table between a user to which the order belongs and 
    multiple products that are part of the order.
*/
const Order = sequelize.define('order', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
});

module.exports = Order;