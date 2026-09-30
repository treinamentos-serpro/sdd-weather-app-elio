import { render, screen, within } from '@testing-library/react';
import ForecastList from '../../src/components/ForecastList';
import { mockWeatherData } from '../../src/mocks/weather';
import type { ForecastDay } from '../../src/types/weather';

describe('ForecastList', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-30T15:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('exibe cinco dias com rótulo, condição, temperaturas e chuva', () => {
    const extraDay: ForecastDay = {
      ...mockWeatherData.forecast[4],
      date: '2026-10-05',
    };

    render(
      <ForecastList forecast={[...mockWeatherData.forecast, extraDay]} unit="celsius" />,
    );

    const cards = screen.getAllByRole('listitem');
    expect(cards).toHaveLength(5);
    expect(within(cards[0]).getByRole('heading', { name: 'Hoje' })).toBeInTheDocument();
    expect(within(cards[1]).getByRole('heading', { name: 'Amanhã' })).toBeInTheDocument();
    expect(within(cards[0]).getByText('30/09')).toBeInTheDocument();
    expect(within(cards[0]).getByText('Nublado')).toBeInTheDocument();
    expect(within(cards[0]).getByText('20 °C')).toBeInTheDocument();
    expect(within(cards[0]).getByText('12 °C')).toBeInTheDocument();
    expect(within(cards[0]).getByText('40%')).toBeInTheDocument();
    expect(screen.queryByText('05/10')).not.toBeInTheDocument();
  });

  it('converte mínimas e máximas para Fahrenheit', () => {
    render(<ForecastList forecast={[mockWeatherData.forecast[0]]} unit="fahrenheit" />);

    expect(screen.getByText('68 °F')).toBeInTheDocument();
    expect(screen.getByText('54 °F')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('identifica individualmente um campo indisponível', () => {
    render(
      <ForecastList
        forecast={[{ ...mockWeatherData.forecast[0], minTemperatureC: null }]}
        unit="celsius"
      />,
    );

    expect(screen.getByText('Indisponível')).toHaveClass('sr-only');
    expect(screen.getByText('20 °C')).toBeInTheDocument();
  });

  it('exibe estado indisponível quando o dia não tem dados meteorológicos', () => {
    const unavailableDay: ForecastDay = {
      date: '2026-09-30',
      weatherCode: null,
      minTemperatureC: null,
      maxTemperatureC: null,
      precipitationProbability: null,
    };

    render(<ForecastList forecast={[unavailableDay]} unit="celsius" />);

    expect(screen.getByText('Previsão indisponível')).toBeInTheDocument();
  });
});