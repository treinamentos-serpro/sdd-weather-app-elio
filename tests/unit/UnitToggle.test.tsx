import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import CurrentWeather from '../../src/components/CurrentWeather';
import UnitToggle from '../../src/components/UnitToggle';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../../src/types/weather';

const city: City = {
  id: 3448439,
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brasil',
  latitude: -23.5475,
  longitude: -46.6361,
};

const current: CurrentWeatherData = {
  temperatureC: 0,
  weatherCode: 0,
  observedAt: null,
};

function WeatherWithUnitToggle() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle onChange={setUnit} unit={unit} />
      <CurrentWeather city={city} current={current} unit={unit} />
    </>
  );
}

describe('UnitToggle', () => {
  it('expõe a unidade ativa e acompanha a prop recebida', () => {
    const { rerender } = render(<UnitToggle onChange={vi.fn()} unit="celsius" />);

    expect(screen.getByRole('group', { name: 'Unidade de temperatura' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Celsius' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Fahrenheit' })).not.toBeChecked();

    rerender(<UnitToggle onChange={vi.fn()} unit="fahrenheit" />);

    expect(screen.getByRole('radio', { name: 'Celsius' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Fahrenheit' })).toBeChecked();
  });

  it('permite escolher as unidades usando as setas do teclado', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<UnitToggle onChange={onChange} unit="celsius" />);

    await user.tab();
    expect(screen.getByRole('radio', { name: 'Celsius' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenNthCalledWith(1, 'fahrenheit');

    rerender(<UnitToggle onChange={onChange} unit="fahrenheit" />);
    expect(screen.getByRole('radio', { name: 'Fahrenheit' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenNthCalledWith(2, 'celsius');

    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('converte 0 °C para 32 °F no clima atual ao selecionar Fahrenheit', async () => {
    const user = userEvent.setup();
    render(<WeatherWithUnitToggle />);

    expect(screen.getByText('0 °C')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Fahrenheit' }));

    expect(screen.getByText('32 °F')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Celsius' }));

    expect(screen.getByText('0 °C')).toBeInTheDocument();
  });
});
