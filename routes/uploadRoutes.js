const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');

// Configure Multer to store files temporarily on disk
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('image'), uploadController.uploadImage);

module.exports = router;
