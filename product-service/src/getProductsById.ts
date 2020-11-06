import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import productList from "../productList.json";
import axios from 'axios'

// function is for async/awit try/catch example
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
  
  let statusCode = 404;
  let result = {  }
  
  try {
    
    const { pathParameters:{productId}} = event;
    
    //  needed as awit using example
    const  weatherData = await getWeatherInfo(productId)

    const product = productList.find(product => product.id === productId)

    if(product){
      statusCode = 200;
      result = product;
    }
    else{
      result = {
        message: 'Product not found'
      }
    }  
  } catch( error ) {
    statusCode = 500;
    result = {
      message: 'internal server error'
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