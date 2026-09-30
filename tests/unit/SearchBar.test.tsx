import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../../src/components/SearchBar';

describe('SearchBar', () => {
  it('exibe controles acessíveis e o aviso de privacidade', () => {
    render(<SearchBar onSearch={vi.fn()} />);

    expect(screen.getByRole('search', { name: 'Buscar cidade' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Buscar cidade' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument();
    expect(
      screen.getByText('O texto da busca é enviado ao serviço de geocodificação Open-Meteo.'),
    ).toBeInTheDocument();
  });

  it('não pesquisa uma cidade vazia', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), '   ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Informe uma cidade');
  });

  it('não dispara a busca quando o campo permanece vazio', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Informe uma cidade');
  });

  it('pesquisa com Enter e remove espaços externos', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(
      screen.getByRole('searchbox', { name: 'Buscar cidade' }),
      '  São Paulo  {Enter}',
    );

    expect(onSearch).toHaveBeenCalledOnce();
    expect(onSearch).toHaveBeenCalledWith('São Paulo');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('desabilita o campo e o botão', () => {
    render(<SearchBar disabled onSearch={vi.fn()} />);

    expect(screen.getByRole('searchbox', { name: 'Buscar cidade' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
  });
});
