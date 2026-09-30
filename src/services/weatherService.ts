import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export type WeatherServiceErrorKind = 'http' | 'api' | 'network' | 'timeout' | 'invalid-response';

export class WeatherServiceError extends Error {
  constructor(
    public readonly kind: WeatherServiceErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAbortError(error: unknown): boolean {
  return isRecord(error) && error.name === 'AbortError';
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

async function fetchWithTimeout<T>(
  url: string,
  readResponse: (response: Response) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return await readResponse(response);
  } catch (error) {
    if (error instanceof WeatherServiceError) throw error;
    if (controller.signal.aborted || isAbortError(error)) {
      throw new WeatherServiceError('timeout', 'A requisição demorou demais.');
    }
    throw new WeatherServiceError('network', 'Falha de rede.');
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim().normalize('NFC');
  if (!query) return [];

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=10&language=pt&format=json`;
  const data = await fetchWithTimeout(url, async (response): Promise<unknown> => {
    if (!response.ok) {
      throw new WeatherServiceError('http', 'Não foi possível buscar a cidade. Tente novamente.');
    }
    try {
      return await response.json();
    } catch (error) {
      if (isAbortError(error) || error instanceof TypeError) throw error;
      throw new WeatherServiceError(
        'invalid-response',
        'Resposta de busca inválida. Tente novamente.',
      );
    }
  });

  if (!isRecord(data)) {
    throw new WeatherServiceError(
      'invalid-response',
      'Resposta de busca inválida. Tente novamente.',
    );
  }
  if (data.error === true) {
    throw new WeatherServiceError('api', 'Não foi possível buscar a cidade. Tente novamente.');
  }
  if (data.results === undefined) return [];
  if (
    !Array.isArray(data.results) ||
    !data.results.every(
      (result) =>
        isRecord(result) &&
        typeof result.name === 'string' &&
        typeof result.latitude === 'number' &&
        Number.isFinite(result.latitude) &&
        typeof result.longitude === 'number' &&
        Number.isFinite(result.longitude),
    )
  ) {
    throw new WeatherServiceError(
      'invalid-response',
      'Resposta de busca inválida. Tente novamente.',
    );
  }

  return data.results.map(
    (result): City => ({
      id: typeof result.id === 'number' ? result.id : null,
      name: result.name as string,
      admin1: typeof result.admin1 === 'string' ? result.admin1 : null,
      country: typeof result.country === 'string' ? result.country : null,
      latitude: result.latitude as number,
      longitude: result.longitude as number,
    }),
  );
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,weather_code',
    daily: 'weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max',
    forecast_days: '5',
    timezone: 'auto',
  });
  const data = await fetchWithTimeout(
    `${FORECAST_URL}?${params}`,
    async (response): Promise<unknown> => {
      if (!response.ok) {
        throw new WeatherServiceError(
          'http',
          'Não foi possível carregar o clima. Tente novamente.',
        );
      }
      try {
        return await response.json();
      } catch (error) {
        if (isAbortError(error) || error instanceof TypeError) throw error;
        throw new WeatherServiceError(
          'invalid-response',
          'Resposta de clima inválida. Tente novamente.',
        );
      }
    },
  );

  if (!isRecord(data)) {
    throw new WeatherServiceError(
      'invalid-response',
      'Resposta de clima inválida. Tente novamente.',
    );
  }
  if (data.error === true) {
    throw new WeatherServiceError('api', 'Não foi possível carregar o clima. Tente novamente.');
  }
  if (!isRecord(data.current) || !isRecord(data.daily)) {
    throw new WeatherServiceError(
      'invalid-response',
      'Resposta de clima incompleta. Tente novamente.',
    );
  }

  const daily = data.daily;
  if (
    !Array.isArray(daily.time) ||
    daily.time.length !== 5 ||
    !daily.time.every((date) => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date))
  ) {
    throw new WeatherServiceError(
      'invalid-response',
      'Resposta de clima incompleta. Tente novamente.',
    );
  }

  let timeZone = 'UTC';
  if (typeof data.timezone === 'string') {
    try {
      new Intl.DateTimeFormat('pt-BR', { timeZone: data.timezone });
      timeZone = data.timezone;
    } catch {
      timeZone = 'UTC';
    }
  }

  const currentData = data.current;
  const offset = finiteNumber(data.utc_offset_seconds);
  let observedAt: string | null = null;
  if (
    offset !== null &&
    typeof currentData.time === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(currentData.time)
  ) {
    const hours = Math.floor(Math.abs(offset) / 3600);
    const minutes = Math.floor((Math.abs(offset) % 3600) / 60);
    const suffix = `${offset < 0 ? '-' : '+'}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    const instant = `${currentData.time.length === 16 ? `${currentData.time}:00` : currentData.time}${suffix}`;
    if (!Number.isNaN(Date.parse(instant))) observedAt = instant;
  }

  const current: CurrentWeather = {
    temperatureC: finiteNumber(currentData.temperature_2m),
    weatherCode: finiteNumber(currentData.weather_code),
    observedAt,
  };
  if (current.temperatureC === null && current.weatherCode === null) {
    throw new WeatherServiceError('invalid-response', 'Clima atual indisponível. Tente novamente.');
  }
  const dailyNumber = (
    key: string,
    index: number,
    nullValue: number | null = null,
  ): number | null => {
    const values = daily[key];
    if (!Array.isArray(values)) return null;
    return values[index] === null ? nullValue : finiteNumber(values[index]);
  };
  const forecast: ForecastDay[] = daily.time.map((date: string, index: number) => ({
    date,
    weatherCode: dailyNumber('weather_code', index),
    minTemperatureC: dailyNumber('temperature_2m_min', index),
    maxTemperatureC: dailyNumber('temperature_2m_max', index),
    precipitationProbability: dailyNumber('precipitation_probability_max', index, 0),
  }));

  return { city, timeZone, current, forecast };
}
