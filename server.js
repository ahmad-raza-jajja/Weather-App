const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static('frontend'));

// Weather endpoint
app.get('/api/weather', async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'City parameter is required'
      });
    }

    if (!process.env.OPENWEATHER_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'OpenWeather API key not configured'
      });
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({
          success: false,
          message: 'City not found. Please check the spelling and try again.'
        });
      }
      
      return res.status(response.status).json({
        success: false,
        message: data.message || 'Failed to fetch weather data'
      });
    }

    // Format the response
    const weatherData = {
      success: true,
      data: {
        city: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        icon: data.weather[0].icon,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        feelsLike: Math.round(data.main.feels_like)
      }
    };

    res.json(weatherData);

  } catch (error) {
    console.error('Weather API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Weather API server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌤️  Weather API server running on http://localhost:${PORT}`);
  console.log(`📂 Frontend available at http://localhost:${PORT}`);
  console.log(`🔧 API endpoint: http://localhost:${PORT}/api/weather?city=<cityname>`);
});