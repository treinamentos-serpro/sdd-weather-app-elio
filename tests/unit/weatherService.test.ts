import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('searchCities', () => {
  it('não acessa a rede para uma busca vazia', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('  ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('codifica o nome normalizado e mapeia resultados com metadados opcionais', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            latitude: -23.55,
            longitude: -46.63,
            admin1: 'São Paulo',
            country: 'Brasil',
          },
          { name: 'São Paulo', latitude: 1, longitude: 2 },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('  Sa\u0303o Paulo  ')).resolves.toEqual([
      {
        id: 3448439,
        name: 'São Paulo',
        latitude: -23.55,
        longitude: -46.63,
        admin1: 'São Paulo',
        country: 'Brasil',
      },
      { id: null, name: 'São Paulo', latitude: 1, longitude: 2, admin1: null, country: null },
    ]);
    const [url] = fetchMock.mock.calls[0];
    expect(new URL(url).searchParams.get('name')).toBe('São Paulo');
    expect(url).toContain('name=');
    expect(url).toContain('%C3%A3');
    expect(new URL(url).searchParams.get('count')).toBe('10');
    expect(new URL(url).searchParams.get('language')).toBe('pt');
    expect(new URL(url).searchParams.get('format')).toBe('json');
  });

  it('retorna [] quando não há resultados', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
    await expect(searchCities('Inexistente')).resolves.toEqual([]);
  });

  it('lança WeatherServiceError para HTTP não-ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(searchCities('São Paulo')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'http',
    });
    await expect(searchCities('São Paulo')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it.each([
    [{ error: true, reason: 'Invalid query' }, 'api'],
    [{ results: 'unexpected' }, 'invalid-response'],
  ])('classifica resposta %j como %s', async (body, kind) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => body }));
    await expect(searchCities('São Paulo')).rejects.toMatchObject({ kind });
  });

  it('classifica falhas de rede', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    await expect(searchCities('São Paulo')).rejects.toMatchObject({
      kind: 'network',
      message: 'Falha de rede.',
    });
  });

  it('classifica JSON malformado', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new SyntaxError('invalid JSON');
        },
      }),
    );
    await expect(searchCities('São Paulo')).rejects.toMatchObject({ kind: 'invalid-response' });
  });

  it('classifica falha de rede durante a leitura do corpo', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new TypeError('connection lost');
        },
      }),
    );
    await expect(searchCities('São Paulo')).rejects.toMatchObject({ kind: 'network' });
  });

  it('aborta buscas que ultrapassam 10 segundos', async () => {
    vi.useFakeTimers();
    try {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockImplementation(
          (_url: string, options: RequestInit) =>
            new Promise((_resolve, reject) => {
              options.signal?.addEventListener('abort', () =>
                reject(new DOMException('Aborted', 'AbortError')),
              );
            }),
        ),
      );

      const pending = expect(searchCities('São Paulo')).rejects.toMatchObject({
        kind: 'timeout',
        message: 'A requisição demorou demais.',
      });
      await vi.advanceTimersByTimeAsync(10_000);
      await pending;
    } finally {
      vi.useRealTimers();
    }
  });

  it('converte AbortError em timeout e sempre libera o timer', async () => {
    vi.useFakeTimers();
    try {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')));
      await expect(searchCities('São Paulo')).rejects.toMatchObject({
        kind: 'timeout',
        message: 'A requisição demorou demais.',
      });
      expect(vi.getTimerCount()).toBe(0);

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
      await expect(searchCities('São Paulo')).resolves.toEqual([]);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});

const city: City = {
  id: 3448439,
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brasil',
  latitude: -23.55,
  longitude: -46.63,
};

describe('getWeather', () => {
  it('consulta current e daily e associa cinco dias e horário local à cidade', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: 'America/Sao_Paulo',
        utc_offset_seconds: -10800,
        current: { time: '2026-09-30T14:30', temperature_2m: 18.2, weather_code: 3 },
        daily: {
          time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
          weather_code: [3, 61, 0, 1, 2],
          temperature_2m_min: [12, 13, 14, 15, 16],
          temperature_2m_max: [20, 21, 22, 23, 24],
          precipitation_probability_max: [40, 65, null, 10, 20],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const weather = await getWeather(city);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.origin).toBe('https://api.open-meteo.com');
    expect(url.searchParams.get('latitude')).toBe('-23.55');
    expect(url.searchParams.get('longitude')).toBe('-46.63');
    expect(url.searchParams.get('current')).toBe('temperature_2m,weather_code');
    expect(url.searchParams.get('daily')).toBe(
      'weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max',
    );
    expect(url.searchParams.get('forecast_days')).toBe('5');
    expect(url.searchParams.get('timezone')).toBe('auto');
    expect(weather.city).toEqual(city);
    expect(weather.timeZone).toBe('America/Sao_Paulo');
    expect(weather.current).toEqual({
      temperatureC: 18.2,
      weatherCode: 3,
      observedAt: '2026-09-30T14:30:00-03:00',
    });
    expect(weather.forecast).toEqual([
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
        minTemperatureC: 13,
        maxTemperatureC: 21,
        precipitationProbability: 65,
      },
      {
        date: '2026-10-02',
        weatherCode: 0,
        minTemperatureC: 14,
        maxTemperatureC: 22,
        precipitationProbability: 0,
      },
      {
        date: '2026-10-03',
        weatherCode: 1,
        minTemperatureC: 15,
        maxTemperatureC: 23,
        precipitationProbability: 10,
      },
      {
        date: '2026-10-04',
        weatherCode: 2,
        minTemperatureC: 16,
        maxTemperatureC: 24,
        precipitationProbability: 20,
      },
    ]);
  });

  it('mantém datas e usa null para campos diários ausentes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          current: { temperature_2m: 0 },
          daily: {
            time: ['2026-12-31', '2027-01-01', '2027-01-02', '2027-01-03', '2027-01-04'],
            weather_code: [0],
          },
        }),
      }),
    );

    const weather = await getWeather(city);
    expect(weather.timeZone).toBe('UTC');
    expect(weather.current).toEqual({ temperatureC: 0, weatherCode: null, observedAt: null });
    expect(weather.forecast).toHaveLength(5);
    expect(weather.forecast[0]).toEqual({
      date: '2026-12-31',
      weatherCode: 0,
      minTemperatureC: null,
      maxTemperatureC: null,
      precipitationProbability: null,
    });
    expect(weather.forecast[1]).toEqual({
      date: '2027-01-01',
      weatherCode: null,
      minTemperatureC: null,
      maxTemperatureC: null,
      precipitationProbability: null,
    });
  });

  it('não inventa instante de observação sem utc_offset_seconds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          timezone: 'America/Sao_Paulo',
          current: { time: '2026-09-30T14:30', temperature_2m: 18 },
          daily: { time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'] },
        }),
      }),
    );
    const weather = await getWeather(city);
    expect(weather.timeZone).toBe('America/Sao_Paulo');
    expect(weather.current.observedAt).toBeNull();
  });

  it('rejeita clima atual sem temperatura nem condição, mesmo com previsão', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          current: {},
          daily: { time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'] },
        }),
      }),
    );
    await expect(getWeather(city)).rejects.toMatchObject({ kind: 'invalid-response' });
  });

  it('normaliza temperatura atual inválida para null sem inventar zero', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          current: { temperature_2m: '18', weather_code: 3 },
          daily: {
            time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
          },
        }),
      }),
    );

    const weather = await getWeather(city);

    expect(weather.current).toEqual({ temperatureC: null, weatherCode: 3, observedAt: null });
  });

  it.each([
    {},
    { current: {} },
    { daily: { time: [] } },
  ])('rejeita resposta incompleta %j', async (part) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => part,
      }),
    );
    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(getWeather(city)).rejects.toMatchObject({ kind: 'invalid-response' });
  });

  it('rejeita resposta HTTP não-ok com WeatherServiceError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'http',
    });
  });

  it.each([
    [{ error: true, reason: 'Invalid coordinates' }, 'api'],
    [{ current: {}, daily: { time: [] } }, 'invalid-response'],
  ])('classifica payload %j como %s', async (body, kind) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => body }));
    await expect(getWeather(city)).rejects.toMatchObject({ kind });
  });

  it('classifica JSON malformado como invalid-response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new SyntaxError('invalid JSON');
        },
      }),
    );
    await expect(getWeather(city)).rejects.toMatchObject({ kind: 'invalid-response' });
  });

  it('classifica falha de rede durante a leitura do forecast', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new TypeError('connection lost');
        },
      }),
    );
    await expect(getWeather(city)).rejects.toMatchObject({ kind: 'network' });
  });
});
