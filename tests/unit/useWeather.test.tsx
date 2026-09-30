import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/services/weatherService')>()),
  searchCities: vi.fn(),
  getWeather: vi.fn(),
}));

const city: City = {
  id: 1,
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brasil',
  latitude: -23.55,
  longitude: -46.63,
};
const weather: WeatherData = {
  city,
  timeZone: 'America/Sao_Paulo',
  current: { temperatureC: 18, weatherCode: 3, observedAt: null },
  forecast: [],
};

beforeEach(() => {
  vi.mocked(searchCities).mockReset();
  vi.mocked(getWeather).mockReset();
});

describe('useWeather', () => {
  it('busca cidades, carrega a primeira e expõe dados e consulta', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather).mockResolvedValue(weather);
    const { result } = renderHook(() => useWeather());
    expect(result.current.status).toBe('idle');

    await act(async () => {
      await result.current.search('  São Paulo  ');
    });

    expect(searchCities).toHaveBeenCalledWith('São Paulo');
    expect(getWeather).toHaveBeenCalledWith(city);
    expect(result.current).toMatchObject({
      status: 'success',
      query: 'São Paulo',
      cities: [city],
      data: weather,
      error: null,
    });
  });

  it('marca empty quando a busca não encontra cidades', async () => {
    vi.mocked(searchCities).mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Inexistente');
    });

    expect(result.current).toMatchObject({ status: 'empty', cities: [], data: null });
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('repete a busca com falha mesmo após uma cidade previamente selecionada', async () => {
    vi.mocked(searchCities)
      .mockResolvedValueOnce([city])
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([]);
    vi.mocked(getWeather).mockResolvedValue(weather);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('São Paulo');
    });
    await act(async () => {
      await result.current.search('Outra cidade');
    });
    expect(result.current).toMatchObject({ status: 'error', data: weather });
    await act(async () => {
      await result.current.retry();
    });

    expect(searchCities).toHaveBeenLastCalledWith('Outra cidade');
    expect(searchCities).toHaveBeenCalledTimes(3);
    expect(getWeather).toHaveBeenCalledTimes(1);
    expect(result.current).toMatchObject({ status: 'empty', data: weather });
  });

  it('repete apenas o clima se a busca encontrou cidade mas o forecast falhou', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather)
      .mockRejectedValueOnce(new WeatherServiceError('network', 'Falha de rede.'))
      .mockResolvedValueOnce(weather);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('São Paulo');
    });
    expect(result.current).toMatchObject({ status: 'error', error: 'Falha de rede.', data: null });
    await act(async () => {
      await result.current.retry();
    });

    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(result.current).toMatchObject({ status: 'success', data: weather, error: null });
  });

  it('seleciona outra cidade sem refazer geocoding', async () => {
    const otherCity = { ...city, id: 2, name: 'Campinas' };
    const otherWeather = { ...weather, city: otherCity };
    vi.mocked(searchCities).mockResolvedValue([city, otherCity]);
    vi.mocked(getWeather).mockResolvedValueOnce(weather).mockResolvedValueOnce(otherWeather);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('São Paulo');
    });
    await act(async () => {
      await result.current.selectCity(otherCity);
    });

    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenLastCalledWith(otherCity);
    expect(result.current).toMatchObject({
      status: 'success',
      data: otherWeather,
      cities: [city, otherCity],
    });
  });

  it('não busca na rede quando o nome está vazio', async () => {
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('   ');
    });

    expect(result.current).toMatchObject({ status: 'error', error: 'Informe uma cidade' });
    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('ignora resultado de busca anterior após uma nova busca', async () => {
    const otherCity = { ...city, id: 2, name: 'Campinas' };
    const otherWeather = { ...weather, city: otherCity };
    let resolveOldSearch!: (cities: City[]) => void;
    vi.mocked(searchCities)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOldSearch = resolve;
          }),
      )
      .mockResolvedValueOnce([otherCity]);
    vi.mocked(getWeather).mockResolvedValue(otherWeather);
    const { result } = renderHook(() => useWeather());

    act(() => {
      void result.current.search('São Paulo');
    });
    await act(async () => {
      await result.current.search('Campinas');
    });
    await act(async () => {
      resolveOldSearch([city]);
    });

    expect(getWeather).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledWith(otherCity);
    expect(result.current).toMatchObject({
      status: 'success',
      query: 'Campinas',
      data: otherWeather,
    });
  });
});
