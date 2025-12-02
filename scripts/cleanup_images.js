

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configuration
cloudinary.config({
  cloud_name: 'drauz5jps',
  api_key: '487263366383376',
  api_secret: 'k1KXCqb-KT8nQVAYENgaIlX1UHE',
});

const SRC_DIR = path.join(__dirname, '../../travel_stays_frontend/src');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

async function getUsedPublicIds() {
  const files = getAllFiles(SRC_DIR);
  const usedPublicIds = new Set();
  // Regex to capture public ID after 'upload/' and optional version 'v12345/'
  // It stops at the file extension.
  // Example: .../upload/v123/folder/image.jpg -> folder/image
  const regex = /https:\/\/res\.cloudinary\.com\/drauz5jps\/image\/upload\/(?:v\d+\/)?(.+?)\.(?:webp|jpg|png|jpeg|avif)/g;

  console.log(`Scanning ${files.length} files in ${SRC_DIR}...`);

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = regex.exec(content)) !== null) {
      usedPublicIds.add(match[1]);
    }
  });
  
  return usedPublicIds;
}

async function getAllCloudinaryResources() {
  let resources = [];
  let next_cursor = null;
  
  do {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'travel_stays_assets/', // Check all assets in this folder
      max_results: 500,
      next_cursor: next_cursor,
    });
    
    resources = resources.concat(result.resources);
    next_cursor = result.next_cursor;
  } while (next_cursor);
  
  return resources;
}

async function main() {
  try {
    console.log('Starting comprehensive cleanup...');
    const usedPublicIds = await getUsedPublicIds();
    console.log(`Found ${usedPublicIds.size} unique used images in the codebase.`);

    console.log('Fetching all images from Cloudinary (prefix: travel_stays_assets/)...');
    const allResources = await getAllCloudinaryResources();
    console.log(`Found ${allResources.length} total images in Cloudinary.`);

    const unusedResources = allResources.filter(resource => !usedPublicIds.has(resource.public_id));
    
    console.log(`Found ${unusedResources.length} unused images.`);
    
    if (unusedResources.length === 0) {
      console.log('No unused images found.');
      return;
    }

    if (process.argv.includes('--delete')) {
      console.log('Deleting unused images...');
      const publicIdsToDelete = unusedResources.map(r => r.public_id);
      
      // Delete in chunks of 100
      for (let i = 0; i < publicIdsToDelete.length; i += 100) {
        const chunk = publicIdsToDelete.slice(i, i + 100);
        const result = await cloudinary.api.delete_resources(chunk);
        console.log('Deleted chunk:', result);
      }
      console.log('Deletion complete.');
    } else {
      console.log('Unused images sample (first 10):');
      unusedResources.slice(0, 10).forEach(r => console.log(r.public_id));
      if (unusedResources.length > 10) console.log(`...and ${unusedResources.length - 10} more.`);
      console.log('\nRun with --delete to remove these images.');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
