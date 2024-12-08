import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';  // Import date formatting library
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define the type for city data
interface City {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
}

interface WeatherDataPoint {
    timestamp: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    rain: number;
    snowfall: number;
    uv_index: number;
}

const WeatherVisualizer: React.FC = () => {
    const [weatherData, setWeatherData] = useState<WeatherDataPoint[]>([]);
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);  // Holds the filtered weather data
    const [days, setDays] = useState<number>(1);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);

    const handleDaysChange = (selectedDays: number) => {
        setDays(selectedDays);
        const updatedChartData = prepareChartData(weatherData, selectedFields);
        setChartData(updatedChartData);  // Update the state to re-render the chart
    };

    // Prepare data for the chart based on selected fields and days
    const filterWeatherData = (weatherData: WeatherDataPoint[], days: number) => {
        const now = new Date();
        return weatherData.filter((dataPoint) => {
            const timestamp = new Date(dataPoint.timestamp);
            const diffInDays = (now.getTime() - timestamp.getTime()) / (1000 * 3600 * 24);  // Difference in days
            return diffInDays <= days;  // Only include data within the selected time range
        });
    };

    const prepareChartData = (weatherData: WeatherDataPoint[], selectedFields: string[]) => {
        // Filter data based on the selected time range (1 day or 7 days)
        const filteredWeatherData = filterWeatherData(weatherData, days);

        // Prepare chart data based on selected fields
        return filteredWeatherData.map((dataPoint) => {
            const chartDataPoint: any = { timestamp: dataPoint.timestamp };
            if (selectedFields.includes('temperature')) chartDataPoint.temperature = dataPoint.temperature_2m;
            if (selectedFields.includes('rain')) chartDataPoint.rain = dataPoint.rain;
            if (selectedFields.includes('snowfall')) chartDataPoint.snowfall = dataPoint.snowfall;
            if (selectedFields.includes('uv_index')) chartDataPoint.uv_index = dataPoint.uv_index;
            return chartDataPoint;
        });
    };

    // Fetch cities and weather data in a single useEffect
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const citiesResponse = await axios.get('http://localhost:5000/api/cities');
                setCities(citiesResponse.data);
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
        };

        fetchCities();
    }, []);  // Run once on component mount to fetch cities

    // Fetch weather data for the selected city and number of days
    useEffect(() => {
        if (selectedCity) {
            const fetchWeatherData = async () => {
                try {
                    const weatherResponse = await axios.get('http://localhost:5000/api/weather', {
                        params: { latitude: selectedCity.latitude, longitude: selectedCity.longitude, days: days }
                    });
                    setWeatherData(weatherResponse.data.data);
                } catch (error) {
                    console.error('Error fetching weather data:', error);
                }
            };

            fetchWeatherData();
        }
    }, [selectedCity, days]);

    const handleFieldChange = (field: string) => {
        setSelectedFields((prev) => {
            if (prev.includes(field)) {
                return prev.filter((item) => item !== field);
            } else {
                return [...prev, field];
            }
        });
    };

    // Handle dropdown change event
    const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const cityId = parseInt(event.target.value, 10);
        const city = cities.find((city) => city.id === cityId) || null;
        setSelectedCity(city);
    };

    return (
        <div>
            <h1>Weather Data Visualization</h1>
            <div>
                <label htmlFor="city-select">Select a City:</label>
                <select id="city-select" onChange={handleCityChange}>
                    <option value="">--Select a city--</option>
                    {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                            {city.name}
                        </option>
                    ))}
                </select>

                {selectedCity && (
                    <div className="coordinates">
                        <p>Latitude: {selectedCity.latitude}</p>
                        <p>Longitude: {selectedCity.longitude}</p>
                    </div>
                )}
            </div>
            <div>
                <label>
                    <input type="checkbox" checked={selectedFields.includes('temperature')}
                           onChange={() => handleFieldChange('temperature')} />
                    Temperature
                </label>
                <label>
                    <input type="checkbox" checked={selectedFields.includes('rain')}
                           onChange={() => handleFieldChange('rain')} />
                    Rain
                </label>
                <label>
                    <input type="checkbox" checked={selectedFields.includes('snowfall')}
                           onChange={() => handleFieldChange('snowfall')} />
                    Snowfall
                </label>
                <label>
                    <input type="checkbox" checked={selectedFields.includes('uv_index')}
                           onChange={() => handleFieldChange('uv_index')} />
                    UV Index
                </label>
            </div>

            <div>
                <button onClick={() => handleDaysChange(1)}>Last 1 Day</button>
                <button onClick={() => handleDaysChange(7)}>Last 7 Days</button>
            </div>

            {selectedFields.length > 0 && (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" tickFormatter={(timestamp) => format(new Date(timestamp), 'MM/dd/yyyy HH:mm')} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {selectedFields.includes('temperature') &&
                            <Line type="monotone" dataKey="temperature" stroke="#8884d8" />}
                        {selectedFields.includes('rain') &&
                            <Line type="monotone" dataKey="rain" stroke="#82ca9d" />}
                        {selectedFields.includes('snowfall') &&
                            <Line type="monotone" dataKey="snowfall" stroke="#ff7300" />}
                        {selectedFields.includes('uv_index') &&
                            <Line type="monotone" dataKey="uv_index" stroke="#ff0000" />}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default WeatherVisualizer;
