import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

const options: ReadonlyArray<{ label: string; symbol: string; value: Unit }> = [
  { label: 'Celsius', symbol: '°C', value: 'celsius' },
  { label: 'Fahrenheit', symbol: '°F', value: 'fahrenheit' },
];

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <fieldset className="inline-flex border border-white/10 bg-white/5 p-1 shadow-glass backdrop-blur-md">
      <legend className="sr-only">Unidade de temperatura</legend>
      {options.map((option) => {
        const isActive = unit === option.value;

        return (
          <label className="cursor-pointer" key={option.value}>
            <input
              aria-label={option.label}
              checked={isActive}
              className="peer sr-only"
              name="temperature-unit"
              onChange={() => onChange(option.value)}
              type="radio"
              value={option.value}
            />
            <span
              aria-hidden="true"
              className={`inline-flex min-h-11 min-w-11 items-center justify-center px-4 py-2 font-semibold transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-inset peer-focus-visible:ring-white ${
                isActive
                  ? 'bg-accent-600 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {option.symbol}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
