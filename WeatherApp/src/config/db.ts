import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";
import fs from "fs/promises";

dotenv.config();

//create database client
const dbClient = new Client({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});

const initDb = async () => {
  try {
    // Connect to the database
    await dbClient.connect();
    console.log("Connected to PostgreSQL");

    // Create the weatherdata table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS weatherdata (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL,
        temperature_2m FLOAT,
        relative_humidity_2m FLOAT,
        rain FLOAT,
        snowfall FLOAT,
        uv_index FLOAT,
        latitude FLOAT,
        longitude FLOAT
      );
    `);
    console.log("Table 'weatherdata' created");

    // Create the cities table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id SERIAL PRIMARY KEY,
        latitude FLOAT NOT NULL,
        longitude FLOAT NOT NULL,
        name VARCHAR(100) NOT NULL
      );
    `);
    console.log("Table 'cities' created");

    // Read the JSON file from src/data/cities
    const filePath = path.resolve("src/data/cities.json");
    const data = JSON.parse(await fs.readFile(filePath, "utf8"));

    // Insert each record into the cities table
    for (const city of data.cities) {
      console.log(city)
      await dbClient.query(
        `INSERT INTO cities (latitude, longitude, name) VALUES ($1, $2, $3)`,
        [city.latitude, city.longitude, city.name]
      );
    }
    console.log("Cities data inserted successfully!");
  } catch (err) {
    // @ts-ignore
    console.error("Error during DB setup:", err.message);
  }
};

initDb();


export default dbClient;
