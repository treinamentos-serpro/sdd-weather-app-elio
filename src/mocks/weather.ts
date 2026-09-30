import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: 'São Paulo',
    admin1: 'São Paulo',
    country: 'Brasil',
    latitude: -23.5475,
    longitude: -46.6361,
  },
  timeZone: 'America/Sao_Paulo',
  current: {
    temperatureC: 18,
    weatherCode: 3,
    observedAt: '2026-09-30T14:30:00-03:00',
  },
  forecast: [
    {
      date: '2026-09-30',
      weatherCode: 3,
      minTemperatureC: 12,
      maxTemperatureC: 20,
      precipitationProbability: 40,
    },
    {
      date: '2026-10-01',
      weatherCode: 61,
      minTemperatureC: 14,
      maxTemperatureC: 19,
      precipitationProbability: 70,
    },
    {
      date: '2026-10-02',
      weatherCode: 2,
      minTemperatureC: 15,
      maxTemperatureC: 23,
      precipitationProbability: 25,
    },
    {
      date: '2026-10-03',
      weatherCode: 1,
      minTemperatureC: 16,
      maxTemperatureC: 26,
      precipitationProbability: 10,
    },
    {
      date: '2026-10-04',
      weatherCode: 0,
      minTemperatureC: 17,
      maxTemperatureC: 28,
      precipitationProbability: 5,
    },
  ],
};
