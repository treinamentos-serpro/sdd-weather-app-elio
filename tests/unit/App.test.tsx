import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';
import App from '../../src/App';
import { mockWeatherData } from '../../src/mocks/weather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/services/weatherService')>()),
  searchCities: vi.fn(),
  getWeather: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(searchCities).mockReset();
  vi.mocked(getWeather).mockReset();
});

describe('App', () => {
  it('inicia ocioso, em Celsius e com atalho para o conteúdo', async () => {
    const user = userEvent.setup();
    render(<App />);

    const skipLink = screen.getByRole('link', { name: 'Ir para o conteúdo' });
    expect(skipLink).toHaveAttribute('href', '#main-content');
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');

    await user.tab();

    expect(skipLink).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'Clima Agora' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Consulte o clima' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Celsius' })).toBeChecked();
  });

  it('carrega o clima da primeira cidade encontrada e converte temperaturas na apresentação', async () => {
    let resolveWeather!: (data: WeatherData) => void;
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveWeather = resolve;
        }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(screen.getByRole('status')).toHaveTextContent('Carregando dados do clima...');

    await waitFor(() => expect(getWeather).toHaveBeenCalledWith(mockWeatherData.city));
    await act(async () => {
      resolveWeather(mockWeatherData);
    });

    expect(
      await screen.findByRole('region', { name: 'Clima atual em São Paulo' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Resultado da consulta' })).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeInTheDocument();
    expect(screen.getByText('18 °C')).toBeInTheDocument();
    expect(searchCities).toHaveBeenCalledWith('São Paulo');

    await user.click(screen.getByRole('radio', { name: 'Fahrenheit' }));

    expect(screen.getByText('64 °F')).toBeInTheDocument();
    expect(screen.getByText('68 °F')).toBeInTheDocument();
  });

  it('exibe erro do clima e recupera sem repetir a busca', async () => {
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather)
      .mockRejectedValueOnce(
        new WeatherServiceError('api', 'Não foi possível carregar o clima. Tente novamente.'),
      )
      .mockResolvedValueOnce(mockWeatherData);
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar o clima. Tente novamente.',
    );
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(
      await screen.findByRole('region', { name: 'Clima atual em São Paulo' }),
    ).toBeInTheDocument();
    expect(searchCities).toHaveBeenCalledOnce();
    expect(getWeather).toHaveBeenCalledTimes(2);
  });

  it('não mantém o clima da cidade anterior quando a nova consulta falha', async () => {
    const otherCity = { ...mockWeatherData.city, id: 2, name: 'Campinas' };
    vi.mocked(searchCities)
      .mockResolvedValueOnce([mockWeatherData.city])
      .mockResolvedValueOnce([otherCity]);
    vi.mocked(getWeather)
      .mockResolvedValueOnce(mockWeatherData)
      .mockRejectedValueOnce(new WeatherServiceError('api', 'Não foi possível carregar o clima.'));
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('searchbox', { name: 'Buscar cidade' });

    await user.type(input, 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await screen.findByRole('region', { name: 'Clima atual em São Paulo' });
    await user.clear(input);
    await user.type(input, 'Campinas');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar o clima.',
    );
    expect(
      screen.queryByRole('region', { name: 'Clima atual em São Paulo' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('18 °C')).not.toBeInTheDocument();
  });

  it('exibe estado vazio quando não há cidades encontradas', async () => {
    vi.mocked(searchCities).mockResolvedValue([]);
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Curitiba');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(
      await screen.findByRole('heading', { name: 'Nenhuma cidade encontrada' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it.each([
    'empty',
    'error',
  ] as const)('preserva a cidade selecionada após busca %s', async (outcome) => {
    vi.mocked(searchCities).mockResolvedValueOnce([mockWeatherData.city]);
    if (outcome === 'empty') {
      vi.mocked(searchCities).mockResolvedValueOnce([]);
    } else {
      vi.mocked(searchCities).mockRejectedValueOnce(
        new WeatherServiceError('network', 'Falha de rede.'),
      );
    }
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('searchbox', { name: 'Buscar cidade' });

    await user.type(input, 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await screen.findByRole('region', { name: 'Clima atual em São Paulo' });
    await user.clear(input);
    await user.type(input, 'Curitiba');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    if (outcome === 'empty') {
      await screen.findByRole('heading', { name: 'Nenhuma cidade encontrada' });
    } else {
      await screen.findByRole('alert');
    }
    expect(screen.getByRole('region', { name: 'Clima atual em São Paulo' })).toBeInTheDocument();
    expect(getWeather).toHaveBeenCalledTimes(1);
  });

  it('exibe erro e permite tentar novamente', async () => {
    vi.mocked(searchCities)
      .mockRejectedValueOnce(new WeatherServiceError('network', 'Falha de rede.'))
      .mockImplementationOnce(() => new Promise(() => {}));
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede.');

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(screen.getByRole('status')).toHaveTextContent('Carregando dados do clima...');
    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(searchCities).toHaveBeenLastCalledWith('São Paulo');
  });
});
