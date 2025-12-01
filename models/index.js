const { Sequelize } = require('sequelize');
const InquiryModel = require('./inquiry');
const PropertyModel = require('./property');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

const Inquiry = InquiryModel(sequelize);
const Property = PropertyModel(sequelize);

module.exports = { sequelize, Inquiry, Property };
