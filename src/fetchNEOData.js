import axios from 'axios';

// Function to fetch real-time NEO data from NASA's NEO API
export const fetchNEOData = async () => {
  const API_KEY = 'ew5wSSkycJDyRhyeznBX6JkaRTRWmImwioGODrTA'; // Your NEO API key

  // Get today's date in the format 'YYYY-MM-DD'
  const today = new Date().toISOString().split('T')[0];

  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${API_KEY}`;

  try {
    const response = await axios.get(url);

    // Logging the response to check its structure
    console.log('API Response:', response.data);

    if (
      response.data &&
      response.data.near_earth_objects &&
      response.data.near_earth_objects[today]
    ) {
      const neos = response.data.near_earth_objects[today];
      console.log('NEOs for today:', neos); // Log NEOs to ensure they are being fetched
      return neos;
    } else {
      console.warn('No NEO data found for today.');
      return []; // Return an empty array if no NEOs are found
    }
  } catch (error) {
    console.error('Error fetching NEO data', error);
    return [];
  }
};
