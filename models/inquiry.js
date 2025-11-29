const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Inquiry', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    propertyId: { type: DataTypes.INTEGER, allowNull: false },
    propertyName: { type: DataTypes.STRING, allowNull: false },
    propertyLocation: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT },
    checkIn: { type: DataTypes.DATEONLY, allowNull: true },
    checkOut: { type: DataTypes.DATEONLY, allowNull: true },
    numberOfRooms: { type: DataTypes.INTEGER, allowNull: true },
    numberOfGuests: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    timestamps: true,
  });
};
