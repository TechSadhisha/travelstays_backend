const fs = require('fs');
const path = require('path');

const MAPPING_FILE = path.join(__dirname, 'migration_map.json');
const FRONTEND_SRC = path.join(__dirname, '../../travel_stays_frontend/src');

// Helper to recursively get all files
const getFiles = (dir) => {
  const subdirs = fs.readdirSync(dir);
  const files = subdirs.map((subdir) => {
    const res = path.resolve(dir, subdir);
    return fs.statSync(res).isDirectory() ? getFiles(res) : res;
  });
  return files.reduce((a, f) => a.concat(f), []);
};

const updateFrontendAssets = () => {
  try {
    if (!fs.existsSync(MAPPING_FILE)) {
      console.error('Migration map not found!');
      return;
    }

    const mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
    const allFiles = getFiles(FRONTEND_SRC);
    let totalUpdated = 0;

    for (const filePath of allFiles) {
      if (!filePath.match(/\.(tsx|ts|jsx|js)$/)) continue;

      let content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const newLines = [];
      let fileUpdated = false;

      for (const line of lines) {
        // Match import statements for assets
        // import logo from "@/assets/logo_final.png";
        const match = line.match(/^import\s+(\w+)\s+from\s+["']@\/assets\/(.+)["'];?$/);

        if (match) {
          const variableName = match[1];
          const relativePath = match[2]; // e.g. logo_final.png

          if (mapping[relativePath]) {
            const url = mapping[relativePath];
            newLines.push(`const ${variableName} = "${url}";`);
            fileUpdated = true;
            totalUpdated++;
          } else {
            // Check if it's a nested path that might match
            // The mapping keys are relative to assets/ e.g. "property_images/bali/foo.jpg"
            // The import might be "property_images/bali/foo.jpg"
            if (mapping[relativePath]) {
                 const url = mapping[relativePath];
                 newLines.push(`const ${variableName} = "${url}";`);
                 fileUpdated = true;
                 totalUpdated++;
            } else {
                console.warn(`[${path.basename(filePath)}] No Cloudinary URL found for: ${relativePath}`);
                newLines.push(line);
            }
          }
        } else {
          newLines.push(line);
        }
      }

      if (fileUpdated) {
        fs.writeFileSync(filePath, newLines.join('\n'));
        console.log(`Updated ${filePath}`);
      }
    }

    console.log(`Total asset references updated: ${totalUpdated}`);

  } catch (error) {
    console.error('Error updating frontend assets:', error);
  }
};

updateFrontendAssets();
