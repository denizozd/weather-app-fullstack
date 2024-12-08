import express from "express";
import bodyParser from "body-parser";
import weatherRoutes from "./routes/weather";
const cors = require('cors');
const app = express();

app.use(cors());

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/api", weatherRoutes);

export default app;
