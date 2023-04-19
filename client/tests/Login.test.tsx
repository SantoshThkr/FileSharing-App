import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosResponse } from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../src/hooks/useAuth';
import Login from '../src/pages/Login';

jest.mock('../src/hooks/useAuth');

const login = jest.fn();

function renderLogin() {
  jest.mocked(useAuth).mockReturnValue({
    user: null,
    loading: false,
    login,
    register: jest.fn(),
    logout: jest.fn(),
  });

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

beforeEach(() => {
  login.mockReset();
});

it('submits the email and password', async () => {
  login.mockResolvedValue(undefined);
  renderLogin();

  await userEvent.type(screen.getByLabelText('Email'), 'demo@example.com');
  await userEvent.type(screen.getByLabelText('Password'), 'password123');
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

  expect(login).toHaveBeenCalledWith({ email: 'demo@example.com', password: 'password123' });
});

it('shows the error returned by the server', async () => {
  const response = { status: 401, data: { message: 'Invalid email or password' } };
  login.mockRejectedValue(
    new AxiosError('Unauthorized', '401', undefined, undefined, response as AxiosResponse)
  );
  renderLogin();

  await userEvent.type(screen.getByLabelText('Email'), 'demo@example.com');
  await userEvent.type(screen.getByLabelText('Password'), 'wrong-password');
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

  expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled();
});
