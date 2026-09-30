import { useEffect, useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

interface WeatherState {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
}

interface UseWeatherResult extends WeatherState {
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

type LastOperation = { kind: 'search'; name: string } | { kind: 'weather'; city: City };

function errorMessage(error: unknown): string {
  return error instanceof WeatherServiceError ? error.message : 'Algo deu errado. Tente novamente.';
}

export function useWeather(): UseWeatherResult {
  const [state, setState] = useState<WeatherState>({
    status: 'idle',
    data: null,
    cities: [],
    error: null,
    query: '',
  });
  const requestId = useRef(0);
  const lastOperation = useRef<LastOperation | null>(null);

  useEffect(
    () => () => {
      requestId.current += 1;
    },
    [],
  );

  async function loadWeather(city: City, id: number): Promise<void> {
    lastOperation.current = { kind: 'weather', city };
    setState((previous) => ({ ...previous, status: 'loading', data: null, error: null }));
    try {
      const data = await getWeather(city);
      if (id !== requestId.current) return;
      setState((previous) => ({ ...previous, status: 'success', data, error: null }));
    } catch (error) {
      if (id !== requestId.current) return;
      setState((previous) => ({
        ...previous,
        status: 'error',
        data: null,
        error: errorMessage(error),
      }));
    }
  }

  async function search(name: string): Promise<void> {
    const query = name.trim().normalize('NFC');
    const id = ++requestId.current;
    if (!query) {
      lastOperation.current = null;
      setState((previous) => ({
        ...previous,
        query,
        status: 'error',
        error: 'Informe uma cidade',
      }));
      return;
    }

    lastOperation.current = { kind: 'search', name: query };
    setState((previous) => ({
      ...previous,
      query,
      status: 'loading',
      cities: [],
      error: null,
    }));
    try {
      const cities = await searchCities(query);
      if (id !== requestId.current) return;
      if (cities.length === 0) {
        setState((previous) => ({ ...previous, status: 'empty', cities: [], error: null }));
        return;
      }
      setState((previous) => ({ ...previous, cities }));
      await loadWeather(cities[0], id);
    } catch (error) {
      if (id !== requestId.current) return;
      setState((previous) => ({ ...previous, status: 'error', error: errorMessage(error) }));
    }
  }

  async function selectCity(city: City): Promise<void> {
    const id = ++requestId.current;
    await loadWeather(city, id);
  }

  async function retry(): Promise<void> {
    const operation = lastOperation.current;
    if (operation?.kind === 'search') await search(operation.name);
    if (operation?.kind === 'weather') await selectCity(operation.city);
  }

  return { ...state, search, selectCity, retry };
}
