import express from "express";
import { getToken } from "../SentinelNodeService/services/TokenService.mjs";
import { sendPostRequest as sendNdviRequest } from "../SentinelNodeService/services/NDVIService.mjs";
import { sendPostRequest as sendTrueColorRequest } from "../SentinelNodeService/services/TrueColorService.mjs";
import { getStatistics } from "../SentinelNodeService/services/StatisticsService.mjs";

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
