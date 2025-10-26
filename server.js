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


// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});






