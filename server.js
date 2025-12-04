require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { sequelize } = require("./models");
const inquiryRouter = require("./routes/inquiry");
const uploadRouter = require("./routes/uploadRoutes");
const propertiesRouter = require("./routes/properties");
const puppeteer = require("puppeteer");
const { isbot } = require("isbot");

const app = express();
app.use(cors()); // Adjust origin as needed
app.use(express.json());

// API Routes
app.use("/api", inquiryRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/properties", propertiesRouter);

// Serve static files from the frontend build directory
const frontendDistPath = path.join(__dirname, "../travel_stays_frontend/dist");
app.use(express.static(frontendDistPath));

// SSR Logic for Bots
app.get("*", async (req, res) => {
  const userAgent = req.get("user-agent");

  // If it's a bot, render with Puppeteer
  if (isbot(userAgent)) {
    console.log(`Bot detected (${userAgent}). Rendering with Puppeteer...`);
    try {
      const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();

      // Construct the local URL to visit
      const localUrl = `http://localhost:${process.env.PORT || 3001}${
        req.originalUrl
      }`;

      // Set a generic user agent to avoid infinite loops if the bot check isn't perfect
      // or to ensure the frontend treats it as a normal user
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
      );

      await page.goto(localUrl, {
        waitUntil: "networkidle0", // Wait for hydration/fetches
        timeout: 30000,
      });

      const html = await page.content();
      await browser.close();

      return res.send(html);
    } catch (error) {
      console.error("SSR Error:", error);
      // Fallback to sending the index.html if SSR fails
      return res.sendFile(path.join(frontendDistPath, "index.html"));
    }
  }

  // If it's a real user, send the React app (CSR)
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

const PORT = process.env.PORT || 3001;

// Attempt DB connection and sync models (creates tables if they don't exist)
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected");
    return sequelize.sync({ alter: true }); // Updates table schema if it exists
  })
  .then(() => {
    console.log("Database tables synced");
  })
  .catch((err) => {
    console.warn("Database connection/sync failed:", err.message);
  });

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
