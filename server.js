import express from "express";
import { getToken } from "./services/TokenService.js";
import { sendPostRequest as sendNdviRequest } from "./services/NDVIService.js";
import { sendPostRequest as sendTrueColorRequest } from "./services/TrueColorService.js";
import { getStatistics } from "./services/StatisticsService.js";
import {sendPostRequestForImage} from "./services/NDVIOnlyImage.js"

const app = express();
const port = 5000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

// Token endpoint (if needed)
app.get("/sentinelToken", async (req, res) => {
  try {
    const token = await getToken();
    res.json({ token });
  } catch (error) {
    console.error("Error fetching token:", error);
    res.status(500).json({ error: "Failed to fetch token" });
  }
});

// NDVI endpoint
app.post("/sentinelndvi", async (req, res) => {
  const { coordinates } = req.body;
  if (!coordinates) {
    return res.status(400).json({ error: "Coordinates are required" });
  }

  try {
    const result = await sendNdviRequest(coordinates);
    res.json({ result });
  } catch (error) {
    console.error("Error processing NDVI request:", error);
    res.status(500).json({ error: "Failed to process NDVI request" });
  }
});

// True Color endpoint
app.post("/sentinelTrueColor", async (req, res) => {
  const { coordinates } = req.body;
  if (!coordinates) {
    return res.status(400).json({ error: "Coordinates are required" });
  }

  try {
    const result = await sendTrueColorRequest(coordinates);
    res.json({ result });
  } catch (error) {
    console.error("Error processing True Color request:", error);
    res.status(500).json({ error: "Failed to process True Color request" });
  }
});

// Statistics endpoint
app.post("/sentinelStatistics", async (req, res) => {
  const { coordinates } = req.body;
  if (!coordinates) {
    return res.status(400).json({ error: "Coordinates are required" });
  }

  try {
    const stats = await getStatistics(coordinates);
    res.json({ stats });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});


app.post("/ndviImage", async (req, res) => {
  const { coordinates } = req.body;
  if (!coordinates) {
    return res.status(400).json({ error: "Coordinates are required" });
  }

  try {
    const imageBuffer = await sendPostRequestForImage(coordinates);
    if (imageBuffer) {
      res.set("Content-Type", "image/jpeg");
      res.send(imageBuffer);
    } else {
      res.status(500).json({ error: "Failed to process NDVI request" });
    }
  } catch (error) {
    console.error("Error processing NDVI request:", error);
    res.status(500).json({ error: "Failed to process NDVI request" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
