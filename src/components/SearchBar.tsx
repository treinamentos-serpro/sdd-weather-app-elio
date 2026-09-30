import { type FormEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [city, setCity] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled) {
      return;
    }

    const normalizedCity = city.trim();

    if (!normalizedCity) {
      setValidationMessage('Informe uma cidade');
      return;
    }

    setValidationMessage(null);
    onSearch(normalizedCity);
  }

  return (
    <form
      className="w-full border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md sm:p-6"
      onSubmit={handleSubmit}
      aria-label="Buscar cidade"
      role="search"
    >
      <label className="mb-2 block font-medium text-white" htmlFor="city-search">
        Buscar cidade
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          aria-describedby={
            validationMessage ? 'search-privacy search-validation' : 'search-privacy'
          }
          aria-invalid={validationMessage ? true : undefined}
          className="min-w-0 flex-1 border border-white/20 bg-night-800 px-4 py-3 text-white placeholder:text-white/50 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          id="city-search"
          name="city"
          onChange={(event) => {
            setCity(event.target.value);
            setValidationMessage(null);
          }}
          placeholder="Ex.: São Paulo"
          type="search"
          value={city}
        />
        <button
          className="min-h-11 bg-accent-600 px-5 py-3 font-semibold text-white transition-shadow hover:ring-2 hover:ring-accent-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:ring-0"
          disabled={disabled}
          type="submit"
        >
          Buscar
        </button>
      </div>
      {validationMessage ? (
        <p className="mt-2 text-sm font-medium text-red-300" id="search-validation" role="alert">
          {validationMessage}
        </p>
      ) : null}
      <p className="mt-3 text-sm text-white/70" id="search-privacy">
        O texto da busca é enviado ao serviço de geocodificação Open-Meteo.
      </p>
    </form>
  );
}
