const fs = require('fs');
const path = require('path');

const MAPPING_FILE = path.join(__dirname, 'migration_map.json');
const PROPERTIES_FILE = path.join(__dirname, '../../travel_stays_frontend/src/data/properties.ts');

const updateProperties = () => {
  try {
    if (!fs.existsSync(MAPPING_FILE)) {
      console.error('Migration map not found!');
      return;
    }

    const mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
    let content = fs.readFileSync(PROPERTIES_FILE, 'utf8');
    const lines = content.split('\n');
    const newLines = [];
    let updatedCount = 0;

    for (const line of lines) {
      // Match import statements for images
      // import laVilla from "@/assets/property_images/pondicherry/la_villa.webp";
      const match = line.match(/^import\s+(\w+)\s+from\s+["']@\/assets\/(.+)["'];?$/);

      if (match) {
        const variableName = match[1];
        const relativePath = match[2]; // e.g. property_images/pondicherry/la_villa.webp

        if (mapping[relativePath]) {
          const url = mapping[relativePath];
          // Replace import with const declaration
          newLines.push(`const ${variableName} = "${url}";`);
          updatedCount++;
        } else {
          console.warn(`No Cloudinary URL found for: ${relativePath}`);
          newLines.push(line); // Keep original if not found
        }
      } else {
        newLines.push(line);
      }
    }

    fs.writeFileSync(PROPERTIES_FILE, newLines.join('\n'));
    console.log(`Updated ${updatedCount} image references in properties.ts`);

  } catch (error) {
    console.error('Error updating properties:', error);
  }
};

updateProperties();
