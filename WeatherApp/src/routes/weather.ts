import { Router, Response, Request } from "express";

import dbClient from "../config/db";
const router = Router();
import {fetchWeatherData} from "../server";

// @ts-ignore
// @ts-ignore
router.get("/weather", async (req, res) => {
  try {
    // Extract query parameters
    const { latitude, longitude, days } = req.query;

    if (!latitude || !longitude || !days) {
      return res.status(400).json({
        error: "Please provide latitude, longitude, and days as query parameters.",
      });
    }

    const latitudeNum = parseFloat(latitude as string);
    const longitudeNum = parseFloat(longitude as string);
    const daysNum = parseInt(days as string);

    if (isNaN(latitudeNum) || isNaN(longitudeNum) || isNaN(daysNum)) {
      return res.status(400).json({
        error: "Latitude, longitude, and days must be valid numbers.",
      });
    }

    if (daysNum !== 1 && daysNum !== 7) {
      return res.status(400).json({
        error: "The 'days' parameter must be either 1 or 7.",
      });
    }

    // Calculate the start and end timestamps for the query
    const startDate = new Date();
    const endDate = new Date();

    if (daysNum === 1) {
      // For 'days = 1', use the last 24 hours
      startDate.setHours(startDate.getHours() - 24);
    } else if (daysNum === 7) {
      // For 'days = 7', use the next 7 days
      endDate.setDate(endDate.getDate() + 7);
    }

    const startTimestamp = startDate.toISOString(); // Convert to ISO format
    const endTimestamp = endDate.toISOString(); // Convert to ISO format for the future date

    console.log(`Querying for data between: ${startTimestamp} and ${endTimestamp}`); // Debugging log

    // Check if data already exists for the given location and time range
    const result = await dbClient.query(
      `SELECT * FROM WeatherData
       WHERE latitude = $1 AND longitude = $2 AND timestamp >= $3 AND timestamp <= $4
       ORDER BY timestamp ASC`,
      [latitudeNum, longitudeNum, startTimestamp, endTimestamp]
    );

    // If no data exists, fetch new data and insert into the database
    if (result.rows.length === 0) {
      console.log('No data found, fetching new data'); // Debugging log
      await fetchWeatherData(latitudeNum, longitudeNum);

      // After inserting the data, re-query to return the newly fetched data
      const updatedResult = await dbClient.query(
        `SELECT * FROM WeatherData
         WHERE latitude = $1 AND longitude = $2 AND timestamp >= $3 AND timestamp <= $4
         ORDER BY timestamp ASC`,
        [latitudeNum, longitudeNum, startTimestamp, endTimestamp]
      );

      res.json({
        latitude: latitudeNum,
        longitude: longitudeNum,
        days: daysNum,
        data: updatedResult.rows,
      });
    } else {
      console.log('Data found in the database'); // Debugging log
      res.json({
        latitude: latitudeNum,
        longitude: longitudeNum,
        days: daysNum,
        data: result.rows,
      });
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Failed to fetch weather data." });
  }
});


// @ts-ignore
router.get("/cities", async (req, res) => {
  try {
    // Query the database for the specified time range
    const result = await dbClient.query(
      `SELECT * FROM cities`
    );
    // Return the result
    res.json(result.rows);

  } catch (error) {
    console.error("Error fetching cities data:", error);
    res.status(500).json({ error: "Failed to fetch cities data." });
  }
});



export default router;
