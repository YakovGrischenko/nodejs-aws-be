import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import productList from "./tests/productList.json";
import axios from 'axios'


const getWeatherInfo = async (productId) => {
  
  const OPEN_WEATHER_URL = 'http://api.openweathermap.org/data/2.5/weather'
  let apiKey = '2b5437d79044ea0ae5c424019c101372'
  let cityName = productId || 'Barnaul'

  if(productId === 'test_catch'){
    apiKey = 'mock_unactive_api_key'
  }

  try{
    const { data } =  await axios.get(`${OPEN_WEATHER_URL}?q=${cityName}&appid=${apiKey}`) 
    return data;
  } catch (error) {
    return {
      message: 'Unable to get weather info'
    }
  }
}

export const getProductsById: APIGatewayProxyHandler = async (event, _context) => {
  const { pathParameters:{productId}} = event;

  const  weatherData = await getWeatherInfo(productId)

  let statusCode = 404;
  let result = {  }

  const filteredProducts = productList.filter((product)=> product.id === productId)

  if(filteredProducts.length > 0){
    statusCode = 200;
    result = filteredProducts[0];
  }
  else{
    result = {
      message: 'Product not found',
      weather: weatherData
    }
  }  

  return {
    statusCode,
    headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
    },
    
    body: JSON.stringify(result, null, 2),
  };
}