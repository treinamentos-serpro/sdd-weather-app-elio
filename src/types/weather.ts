export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: number | null;
  name: string;
  admin1: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperatureC: number | null;
  weatherCode: number | null;
  observedAt: string | null;
}

export interface ForecastDay {
  date: string;
  weatherCode: number | null;
  minTemperatureC: number | null;
  maxTemperatureC: number | null;
  precipitationProbability: number | null;
}

export interface WeatherData {
  city: City;
  timeZone: string;
  current: CurrentWeather;
  forecast: ForecastDay[];
}
