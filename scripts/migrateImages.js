const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../../travel_stays_frontend/src/assets');
const OUTPUT_FILE = path.join(__dirname, 'migration_map.json');

// Helper to recursively get all files
const getFiles = (dir) => {
  const subdirs = fs.readdirSync(dir);
  const files = subdirs.map((subdir) => {
    const res = path.resolve(dir, subdir);
    return fs.statSync(res).isDirectory() ? getFiles(res) : res;
  });
  return files.reduce((a, f) => a.concat(f), []);
};

const migrateImages = async () => {
  try {
    // Load existing mapping if it exists to avoid re-uploading
    let mapping = {};
    if (fs.existsSync(OUTPUT_FILE)) {
      mapping = JSON.parse(fs.readFileSync(OUTPUT_FILE));
    }

    const allFiles = getFiles(ASSETS_DIR);
    console.log(`Found ${allFiles.length} total files in ${ASSETS_DIR}`);

    for (const filePath of allFiles) {
      if (filePath.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
        const relativePath = path.relative(ASSETS_DIR, filePath);
        
        // Skip if already uploaded
        if (mapping[relativePath]) {
          console.log(`Skipping ${relativePath} (already uploaded)`);
          continue;
        }

        console.log(`Uploading ${relativePath}...`);
        
        // Create a folder structure in Cloudinary matching the local one
        // e.g. assets/property_images/bali -> travel_stays_assets/property_images/bali
        const folderName = path.dirname(relativePath);
        const cloudinaryFolder = folderName === '.' 
          ? 'travel_stays_assets' 
          : `travel_stays_assets/${folderName}`;

        try {
          const result = await cloudinary.uploader.upload(filePath, {
            folder: cloudinaryFolder,
            use_filename: true,
            unique_filename: false,
          });
          
          mapping[relativePath] = result.secure_url;
          console.log(`Uploaded ${relativePath} -> ${result.secure_url}`);
          
          // Save progress periodically
          fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mapping, null, 2));
        } catch (err) {
          console.error(`Failed to upload ${relativePath}:`, err.message);
        }
      }
    }

    console.log(`Migration complete. Mapping saved to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

migrateImages();
