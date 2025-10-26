import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const BESTTIME_API_KEY = "REPLACE_WITH_BESTTIME_API_KEY";
const GOOGLE_API_KEY = "REPLACE_WITH_GOOGLE_API_KEY";


// Fetch bars/venues from BestTime
app.post("/api/bars", async (req, res) => {
  const { lat, lon } = req.body;
  if (!lat || !lon) return res.status(400).json({ error: "Missing lat/lon" });

  const params = new URLSearchParams({
    api_key_private: BESTTIME_API_KEY,
    types: "BAR,BREWERY,CLUBS,",
    lat: lat.toString(),
    lng: lon.toString(),
    radius: "10000",
    order_by: "day_rank_max,reviews",
    order: "desc,desc",
    foot_traffic: "both",
    limit: "20",
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


// Fetch Google Place details
// ✅ Fetch detailed Google Place data with ratings & reviews
app.post("/api/places", async (req, res) => {
  const { lat, lon } = req.body;
  if (!lat || !lon) return res.status(400).json({ error: "Missing lat/lon" });

  try {
    // Nearby search for bars around the location
    const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&type=bar&key=${GOOGLE_API_KEY}`;
    const nearbyRes = await fetch(nearbyUrl);
    const nearbyData = await nearbyRes.json();

    if (!nearbyData.results?.length) {
      return res.json({ results: [] });
    }

    // For each nearby place, fetch *detailed* info
    const detailedResults = await Promise.all(
      nearbyData.results.map(async (place) => {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,user_ratings_total,formatted_address,geometry,photos,editorial_summary,reviews,opening_hours,website&key=${GOOGLE_API_KEY}`;
        const detailsRes = await fetch(detailsUrl);
        const detailsData = await detailsRes.json();
        return detailsData.result;
      })
    );

    // Return the fully-detailed Google Places data
    res.json({ results: detailedResults });
  } catch (err) {
    console.error("Google Places proxy error:", err);
    res.status(500).json({ error: "Server proxy failed" });
  }
});


// google photo info
app.get("/api/photo", async (req, res) => {
  const { ref } = req.query;
  if (!ref) return res.status(400).send("Missing photo reference");

  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${ref}&key=${GOOGLE_API_KEY}`;
  const response = await fetch(photoUrl);
  const buffer = await response.arrayBuffer();

  res.set("Content-Type", response.headers.get("content-type"));
  res.send(Buffer.from(buffer));
});


// Start server
app.listen(3000, () => console.log("✅ Proxy running on http://localhost:3000"));
