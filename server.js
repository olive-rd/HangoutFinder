import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Recreate __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get API key from environment variables
const BESTTIME_API_KEY = process.env.BESTTIME_API_KEY;

if (!BESTTIME_API_KEY) {
    console.error('❌ BESTTIME_API_KEY not found in environment variables');
    console.log('Please add BESTTIME_API_KEY=your_api_key to your .env file');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static('.'));

// Parse JSON bodies
app.use(express.json());



// API endpoint to get venue data
app.post('/api/venue-forecast', async (req, res) => {
  try {
    const { venue_name, venue_address } = req.body;
    
    // Log the incoming request data
    console.log('🔥 SERVER: Received request data:', {
      venue_name,
      venue_address,
      timestamp: new Date().toISOString()
    });
    
    const params = new URLSearchParams({ 
      'api_key_private': BESTTIME_API_KEY,
      'venue_name': venue_name || 'Novela',
      'venue_address': venue_address || '662 Mission St San Francisco, CA 94105 United States'
    });

    // Log the API URL being called
    const apiUrl = `https://besttime.app/api/v1/forecasts?${params}`;
    console.log('🌐 SERVER: Making API call to:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST'
    });
    
    const data = await response.json();
    
    // Log the API response
    console.log('📡 SERVER: BestTime API response status:', response.status);
    console.log('📋 SERVER: BestTime API response data:', JSON.stringify(data, null, 2));
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching venue data:', error);
    res.status(500).json({ error: 'Failed to fetch venue data' });
  }
});

// Combined endpoint: Get nearby venues WITH forecast data
app.post("/api/bars", async (req, res) => {
  console.log('🔥 /api/bars endpoint hit with data:', req.body);
  
  const { lat, lon, radius = 5000, limit = 10, types = "BAR,CAFE,RESTAURANT,BREWERY" } = req.body;
  
  if (!lat || !lon) {
    console.log('❌ Missing lat/lon in request');
    return res.status(400).json({ error: "Missing lat/lon" });
  }

  console.log('📍 Using coordinates:', { lat, lon, radius, limit, types });

  // Step 1: Get venues by location
  const venueParams = new URLSearchParams({
    api_key_private: BESTTIME_API_KEY,
    types: types,
    lat: lat.toString(),
    lng: lon.toString(),
    radius: radius.toString(),
    order_by: "day_rank_max,reviews",
    order: "desc,desc",
    foot_traffic: "both",
    limit: limit.toString(),
    page: "0",
  });

  try {
    const venueUrl = `https://besttime.app/api/v1/venues/filter?${venueParams.toString()}`;
    console.log('🌐 Making venue search API request to:', venueUrl);
    console.log('📍 Coordinates:', { lat, lon, radius });
    
    const venueResponse = await fetch(venueUrl);
    const venueData = await venueResponse.json();
    
    console.log('📊 Venue API Response status:', venueResponse.status);
    console.log('📊 Found venues:', venueData.venues?.length || 0);

    if (venueData.venues && venueData.venues.length > 0) {
      // Step 2: For each venue, get forecast data
      const venuesWithForecasts = await Promise.allSettled(
        venueData.venues.slice(0, 5).map(async (venue) => { // Limit to first 5 to avoid rate limits
          try {
            if (venue.venue_name && venue.venue_address) {
              const forecastParams = new URLSearchParams({
                'api_key_private': BESTTIME_API_KEY,
                'venue_name': venue.venue_name,
                'venue_address': venue.venue_address
              });

              const forecastUrl = `https://besttime.app/api/v1/forecasts?${forecastParams}`;
              const forecastResponse = await fetch(forecastUrl, { method: 'POST' });
              const forecastData = await forecastResponse.json();

              return {
                ...venue,
                forecast: forecastData
              };
            }
            return venue;
          } catch (error) {
            console.log(`⚠️ Failed to get forecast for ${venue.venue_name}:`, error.message);
            return venue; // Return venue without forecast if forecast fails
          }
        })
      );

      // Extract successful results
      const results = venuesWithForecasts
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);

      res.json({
        ...venueData,
        venues: results
      });
    } else {
      res.json(venueData);
    }
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Server proxy failed" });
  }
});


// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});






