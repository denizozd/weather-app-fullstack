# Weather App Fullstack

This project contains both the frontend (**weather-ui**) and backend (**WeatherApp**) for a weather application. It allows users to search for cities and view weather data for selected locations.

---

## Project Structure

### 1. **weather-ui**
A React and TypeScript application that serves as the UI for the Weather App.

#### Instructions to Run Locally:
1. Navigate to the frontend directory:
   ```bash 
   cd weather-ui/weather-ui
Start the development server:
```bash   
npm run dev
```

The application will be available at:
http://localhost:5173/

2. WeatherApp
A Node.js backend that provides APIs for fetching cities and weather data.

#### Instructions to Run Locally:
Navigate to the backend directory:
```bash
cd WeatherApp
```
Compile the TypeScript code:
```bash
npx tsc
```
Start the backend server:
```bash
node dist/server.js
```
The application will run at:
http://localhost:5000/
API Endpoints:
GET /api/cities
Returns a list of cities with their latitude and longitude.

GET /api/weather?latitude={latitude}&longitude={longitude}&days={days}
Fetches weather data for a specific city and number of days (1 or 7).

Example Request:
http://localhost:5000/api/weather?latitude=48.1374&longitude=11.5755&days=1

### Local Setup
Clone the repository:
```bash
git clone git@github.com:denizozd/weather-app-fullstack.git
```
Navigate to the root directory:
```bash
cd weather-app-fullstack
```
Run the application using Docker Compose:
```bash
docker-compose up --build
```

### Deployment
The app is deployed to AWS. Follow these steps to build and push the Docker images:

#### Build the images:


docker-compose build
Tag and push the images to AWS Elastic Container Registry (ECR):
```bash
docker tag db:latest <id>.dkr.ecr.<region>.amazonaws.com/db:latest
docker push <id>.dkr.ecr.<region>.amazonaws.com/db:latest
```
```bash
docker tag weatherapp-frontend:latest <id>.dkr.ecr.<region>.amazonaws.com/weatherapp-frontend:latest
docker push <id>.dkr.ecr.<region>.amazonaws.com/weatherapp-frontend:latest
```
```bash
docker tag weatherapp-backend:latest <id>.dkr.ecr.<region>.amazonaws.com/weatherapp-backend:latest
docker push <id>.dkr.ecr.<region>.amazonaws.com/weatherapp-backend:latest
```

Public Access:
Frontend: http://13.60.196.41:5173/

## Known Issues
### Deployment Issue:
The backend cannot establish a connection with the database due to the error:
Error during DB setup: getaddrinfo ENOTFOUND weatherapp-db
As a result, the cities API does not function as expected in the deployed version.

### Local Bugs:

The UI occasionally requires multiple clicks on buttons to respond.
Minor frontend issues still need to be resolved.
