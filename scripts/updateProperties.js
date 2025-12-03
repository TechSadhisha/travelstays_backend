const fs = require("fs");
const path = require("path");

const MAPPING_FILE = path.join(__dirname, "migration_map.json");
const PROPERTIES_FILE = path.join(
  __dirname,
  "../../travel_stays_frontend/src/data/properties.ts"
);

const updateProperties = () => {
  try {
    if (!fs.existsSync(MAPPING_FILE)) {
      console.error("Migration map not found!");
      return;
    }

    const mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, "utf8"));
    let content = fs.readFileSync(PROPERTIES_FILE, "utf8");

    // Regex to find strings starting with /assets/
    // We want to match "/assets/..." including quotes
    const regex = /"\/assets\/([^"]+)"/g;

    let updatedCount = 0;
    const newContent = content.replace(regex, (match, relativePath) => {
      // relativePath is the part after /assets/
      // e.g. Puducherry/Luxury/Accord Puducherry/Pool Sunbed.webp

      // Check exact match
      if (mapping[relativePath]) {
        updatedCount++;
        return `"${mapping[relativePath]}"`;
      }

      // Check if maybe there's a URL encoding difference or similar
      // But for now, let's stick to exact match.
      // The migration script uses `path.relative` which should match the file system structure.
      // properties.ts paths also seem to match file system structure.

      console.warn(`No Cloudinary URL found for: ${relativePath}`);
      return match;
    });

    fs.writeFileSync(PROPERTIES_FILE, newContent);
    console.log(`Updated ${updatedCount} image references in properties.ts`);
  } catch (error) {
    console.error("Error updating properties:", error);
  }
};

updateProperties();
