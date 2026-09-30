import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from '../../src/components/states/EmptyState';
import ErrorState from '../../src/components/states/ErrorState';
import LoadingState from '../../src/components/states/LoadingState';

describe('componentes de estado', () => {
  it('anuncia a mensagem de carregamento como status', () => {
    render(<LoadingState message="Carregando previsão..." />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando previsão...');
  });

  it('exibe erro e permite tentar novamente', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState message="Não foi possível carregar o clima atual." onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar o clima atual.');

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('exibe título e dica do estado vazio sem alerta', () => {
    render(
      <EmptyState
        hint="Revise o nome informado e faça uma nova busca."
        title="Nenhuma cidade encontrada"
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma cidade encontrada');
    expect(
      screen.getByRole('heading', { level: 2, name: 'Nenhuma cidade encontrada' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Revise o nome informado e faça uma nova busca.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
