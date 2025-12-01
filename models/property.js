const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Property', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    fullDescription: { type: DataTypes.TEXT },
    
    // Price details
    price: { type: DataTypes.STRING }, // Display string e.g. "₹9,000 - ₹14,000"
    priceMin: { type: DataTypes.INTEGER },
    priceMax: { type: DataTypes.INTEGER },
    
    // Capacity & Rooms
    bedrooms: { type: DataTypes.INTEGER },
    bathrooms: { type: DataTypes.INTEGER },
    guests: { type: DataTypes.INTEGER },
    propertySize: { type: DataTypes.STRING },
    
    // Categorization
    collection: { 
      type: DataTypes.ENUM('premium', 'signature'),
      defaultValue: 'signature'
    },
    destination: { type: DataTypes.STRING },
    propertyType: { 
      type: DataTypes.ENUM('hotel', 'villa', 'resort', 'boutique'),
      defaultValue: 'hotel'
    },
    tier: {
      type: DataTypes.ENUM('Budget', 'Premium', 'Luxury'),
      allowNull: true
    },

    // Images
    image: { type: DataTypes.STRING, allowNull: false }, // Main image
    images: { type: DataTypes.JSON }, // Array of strings

    // JSON Arrays for lists
    features: { type: DataTypes.JSON },
    amenities: { type: DataTypes.JSON },
    staffServices: { type: DataTypes.JSON },
    termsConditions: { type: DataTypes.JSON },
    bedroomsDetails: { type: DataTypes.JSON }, // Array of objects

    // Location
    coordinates: { type: DataTypes.JSON }, // { lat: number, lng: number }

    // Boolean flags
    wifi: { type: DataTypes.BOOLEAN, defaultValue: false },
    pool: { type: DataTypes.BOOLEAN, defaultValue: false },
    restaurant: { type: DataTypes.BOOLEAN, defaultValue: false },
    parking: { type: DataTypes.BOOLEAN, defaultValue: false },
    spa: { type: DataTypes.BOOLEAN, defaultValue: false },
    beachAccess: { type: DataTypes.BOOLEAN, defaultValue: false },

    // Ratings
    rating: { type: DataTypes.FLOAT },
    reviewCount: { type: DataTypes.INTEGER },

    // Times
    checkIn: { type: DataTypes.STRING },
    checkOut: { type: DataTypes.STRING },
    cancellationPolicy: { type: DataTypes.STRING }

  }, {
    timestamps: true,
  });
};
