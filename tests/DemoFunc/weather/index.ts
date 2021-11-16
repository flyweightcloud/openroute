import { Context, HttpRequest } from "@azure/functions"
import { get } from "@flyweight.cloud/request";
import Swaggerist, { schemaBuilder, Responses, SwaggerOperationObject, queryParamBuilder } from "@flyweight.cloud/swaggerist";
import { OpenRoute } from "../../../src/index"

const API_KEY = process.env.OPENWEATHER_API_KEY;

const weatherApiResponse = {
  "coord": {
    "lon": -122.08,
    "lat": 37.39
  },
  "weather": [
    {
      "id": 800,
      "main": "Clear",
      "description": "clear sky",
      "icon": "01d"
    }
  ],
  "base": "stations",
  "main": {
    "temp": 282.55,
    "feels_like": 281.86,
    "temp_min": 280.37,
    "temp_max": 284.26,
    "pressure": 1023,
    "humidity": 100
  },
  "visibility": 16093,
  "wind": {
    "speed": 1.5,
    "deg": 350
  },
  "clouds": {
    "all": 1
  },
  "dt": 1560350645,
  "sys": {
    "type": 1,
    "id": 5122,
    "message": 0.0139,
    "country": "US",
    "sunrise": 1560343627,
    "sunset": 1560396563
  },
  "timezone": -25200,
  "id": 420006353,
  "name": "Mountain View",
  "cod": 200
};

const app = new OpenRoute({
  swaggerist: Swaggerist.create({
    info: {
      title: "Weather APi",
      description: "Flyweights demo weather API",
      version: "1.0.0",
    }
  })
});

const currentWeatherDefinition: SwaggerOperationObject = {
  operationId: "getCurrentWeather",
  parameters: [...queryParamBuilder({zip: "12345", city: "Mountain View"})],
  responses: {
    200: Responses.Success(schemaBuilder(weatherApiResponse)),
  }
}

app.route({get: "/current", swagger: currentWeatherDefinition}, async (context: Context, req: HttpRequest): Promise<void> => {
    context.log("HTTP trigger function processed a request.");

    let url = `https://api.openweathermap.org/data/2.5/weather?q=${req.query.city}&appid=${API_KEY}`
    if (req.query.zip) {
      url = `https://api.openweathermap.org/data/2.5/weather?zip=${req.query.zip}&appid=${API_KEY}`

    }
    const weather = await get(url)

    context.res = {
        body: weather.body,
        headers: {"Content-Type": "application/json"},
    };

});

export default app.getHttpTrigger();