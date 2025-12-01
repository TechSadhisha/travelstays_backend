const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'travel_stays_properties', // Optional: organize uploads into a folder
    });

    // Remove the file from local storage after upload (optional but recommended if using diskStorage)
    // If using memoryStorage, this step is not needed, but multer default is diskStorage often or needs config.
    // We'll assume default multer disk storage for now which saves to a temp dir.
    // Actually, let's verify multer config in routes.
    if (req.file.path) {
        fs.unlinkSync(req.file.path);
    }

    res.status(200).json({
      message: 'Image uploaded successfully',
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  uploadImage,
};
