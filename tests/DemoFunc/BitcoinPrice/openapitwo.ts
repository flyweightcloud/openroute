// Do not edit this file, it was created from a YAML file
export default {
  "swagger": "2.0",
  "info": {
    "title": "Bitcoin price connector",
    "description": "Get the price of Bitcoin with Swagger",
    "version": "1.0",
    "contact": {},
  },
  "host": "$__HOSTNAME__",
  "basePath": "/",
  "schemes": [
    "https",
  ],
  "consumes": [],
  "produces": [],
  "paths": {
    "$__BASE_PATH__/usd": {
      "get": {
        "summary": "Get the price of Bitcoin in USD",
        "operationId": "BitcoinPriceUSD",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Result",
            "schema": {
              "type": "object",
              "properties": {
                "BTC-USD": {
                  "type": "string",
                  "description": "USD Price for Bitcoin",
                },
              },
            },
          },
        },
      },
    },
    "$__BASE_PATH__/gbp": {
      "get": {
        "summary": "Get the price of Bitcoin in Great British Pounds",
        "operationId": "BitcoinPriceGBP",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Result",
            "schema": {
              "type": "object",
              "properties": {
                "BTC-GBP": {
                  "type": "string",
                  "description": "GBP Price for Bitcoin",
                },
              },
            },
          },
        },
      },
    },
  },
  "definitions": {},
  "parameters": {},
  "responses": {},
  "securityDefinitions": null,
  "security": null,
  "tags": [
    {
      "name": "bitcoin",
      "description": "Bitcoin price ticker",
    },
  ],
};