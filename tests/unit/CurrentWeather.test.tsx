import { render, screen } from '@testing-library/react';
import CurrentWeather from '../../src/components/CurrentWeather';
import type { City, CurrentWeather as CurrentWeatherData } from '../../src/types/weather';

const city: City = {
  id: 3448439,
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brasil',
  latitude: -23.5475,
  longitude: -46.6361,
};

const current: CurrentWeatherData = {
  temperatureC: 18,
  weatherCode: 3,
  observedAt: '2026-09-30T14:30:00-03:00',
};

describe('CurrentWeather', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-30T18:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('exibe cidade, temperatura, condição e horário da observação', () => {
    render(<CurrentWeather city={city} current={current} unit="celsius" />);

    expect(screen.getByRole('region', { name: 'Clima atual em São Paulo' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    expect(screen.getByText('18 °C')).toBeInTheDocument();
    expect(screen.getByText('Nublado')).toBeInTheDocument();
    expect(screen.getByText('14:30')).toBeInTheDocument();
    expect(screen.queryByText('Desatualizado')).not.toBeInTheDocument();
  });

  it('converte a temperatura para Fahrenheit', () => {
    render(<CurrentWeather city={city} current={current} unit="fahrenheit" />);

    expect(screen.getByText('64 °F')).toBeInTheDocument();
  });

  it('indica horário e condição indisponíveis sem inventar valores', () => {
    render(
      <CurrentWeather
        city={city}
        current={{ ...current, observedAt: null, weatherCode: null }}
        unit="celsius"
      />,
    );

    expect(screen.getByText('18 °C')).toBeInTheDocument();
    expect(screen.getByText('Horário de atualização indisponível')).toBeInTheDocument();
    expect(screen.getByText('Indisponível')).toHaveClass('sr-only');
  });

  it('não exibe temperatura ausente como zero e mantém a condição válida', () => {
    render(
      <CurrentWeather
        city={city}
        current={{ ...current, temperatureC: null, observedAt: null }}
        unit="celsius"
      />,
    );

    expect(screen.getByRole('region', { name: 'Clima atual em São Paulo' })).toHaveTextContent(
      'Nublado',
    );
    expect(screen.getByText('Indisponível')).toHaveClass('sr-only');
    expect(screen.queryByText('0 °C')).not.toBeInTheDocument();
  });

  it('marca como desatualizada uma observação com mais de duas horas', () => {
    vi.setSystemTime(new Date('2026-09-30T19:31:00Z'));

    render(<CurrentWeather city={city} current={current} unit="celsius" />);

    expect(screen.getByText('Desatualizado')).toBeInTheDocument();
  });
});
