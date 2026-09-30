import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  const visibleForecast = forecast.slice(0, 5);

  return (
    <section aria-labelledby="forecast-heading" className="w-full">
      <h2 className="mb-4 text-xl font-semibold text-white sm:text-2xl" id="forecast-heading">
        Previsão de 5 dias
      </h2>

      {visibleForecast.length === 0 ? (
        <p className="text-white/70">Previsão indisponível</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {visibleForecast.map((day, index) => (
            <li key={day.date}>
              <ForecastCard day={day} index={index} unit={unit} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
