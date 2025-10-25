// proxy.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const BESTTIME_API_KEY = "put_the_key_here_pretty_please"; // <-- replace with your private key

app.post("/api/bars", async (req, res) => {
  const { lat, lon } = req.body;
  if (!lat || !lon) return res.status(400).json({ error: "Missing lat/lon" });

  const params = new URLSearchParams({
    api_key_private: BESTTIME_API_KEY,
    types: "BAR,CAFE,RESTAURANT,BREWERY",
    lat: lat.toString(),
    lng: lon.toString(),
    radius: "5000",
    order_by: "day_rank_max,reviews",
    order: "desc,desc",
    foot_traffic: "both",
    limit: "10",
    page: "0",
  });

  try {
    const response = await fetch(`https://besttime.app/api/v1/venues/filter?${params.toString()}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Server proxy failed" });
  }
});

app.listen(3000, () => console.log("✅ Proxy running on http://localhost:3000"));
