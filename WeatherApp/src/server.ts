import app from "./app";
import axios from "axios";
import dbClient from "./config/db";
import schedule from "node-schedule";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export async function fetchWeatherData(latitude: number, longitude: number) {
  try {
    // Get the current time in ISO format for the `start` parameter
    const now = new Date();
    const formattedStart = now.toISOString().split(".")[0]; // Remove milliseconds for API compatibility

    // Build the API URL with the `start` parameter and dynamic latitude and longitude
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,rain,snowfall,uv_index&timezone=Europe%2FBerlin&start=${formattedStart}`;

    // Check if data for the current timestamp already exists in the database
    const result = await dbClient.query(
      "SELECT 1 FROM WeatherData WHERE latitude = $1 AND longitude = $2 AND timestamp >= $3 LIMIT 1",
      [latitude, longitude, formattedStart]
    );

    // If data exists, return immediately without fetching new data
    if (result.rows.length > 0) {
      console.log("Data already exists for the given time and location.");
      return; // Skip fetching and inserting if data already exists
    }

    // Fetch weather data from the external API
    const response = await axios.get(apiUrl);
    const weatherData = response.data.hourly;

    // Prepare weather data for insertion
    const dataPoints = weatherData.time.map((timestamp: string, index: number) => ({
      timestamp,
      temperature_2m: weatherData.temperature_2m[index],
      relative_humidity_2m: weatherData.relative_humidity_2m[index],
      rain: weatherData.rain[index],
      snowfall: weatherData.snowfall[index],
      uv_index: weatherData.uv_index[index],
      latitude: latitude,
      longitude: longitude,
    }));

    // Insert the fetched data into the database
    for (const point of dataPoints) {
      const { timestamp, latitude, longitude } = point;

      // Check if the timestamp already exists for this location
      const duplicateResult = await dbClient.query(
        "SELECT 1 FROM WeatherData WHERE timestamp = $1 AND latitude = $2 AND longitude = $3",
        [timestamp, latitude, longitude]
      );

      if (duplicateResult.rows.length === 0) {
        // Insert the new record if no duplicate is found
        await dbClient.query(
          `INSERT INTO WeatherData (timestamp, temperature_2m, relative_humidity_2m, rain, snowfall, uv_index, latitude, longitude)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            point.timestamp,
            point.temperature_2m,
            point.relative_humidity_2m,
            point.rain,
            point.snowfall,
            point.uv_index,
            point.latitude,
            point.longitude,
          ]
        );
        console.log(`Inserted data for timestamp: ${timestamp}`);
      } else {
        console.log(`Data for timestamp ${timestamp} already exists in the database.`);
      }
    }

  } catch (error) {
    console.error("Error fetching or inserting weather data:", error);
  }
}


// Schedule the task to run every hour
schedule.scheduleJob("0 * * * *", async () => {
  try {
    // Query all cities (latitude and longitude) from the cities table
    const result = await dbClient.query(`SELECT latitude, longitude FROM cities`);

    // Loop through each city and call fetchWeatherData
    for (const city of result.rows) {
      const { latitude, longitude } = city;

      console.log(`Fetching weather data for latitude: ${latitude}, longitude: ${longitude}`);

      // Fetch and insert weather data for this city
      await fetchWeatherData(latitude, longitude);
    }

    console.log("Weather data fetch complete for all cities.");
  } catch (error) {
    console.error("Error in scheduled task:", error);
  }
});

console.log("Weather data job scheduled.");


