import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuth } from '../src/hooks/useAuth';
import Files from '../src/pages/Files';
import { deleteFile, getFiles } from '../src/services/fileApi';
import { UserFile } from '../src/types/file';

jest.mock('../src/hooks/useAuth');
jest.mock('../src/services/fileApi');

const resume: UserFile = {
  id: '1',
  originalName: 'resume.pdf',
  mimeType: 'application/pdf',
  size: 250880,
  createdAt: '2023-10-02T10:00:00.000Z',
};

const notes: UserFile = {
  id: '2',
  originalName: 'notes.txt',
  mimeType: 'text/plain',
  size: 12288,
  createdAt: '2023-10-03T10:00:00.000Z',
};

function listResponse(files: UserFile[]) {
  return { files, pagination: { page: 1, limit: 10, total: files.length, totalPages: 1 } };
}

beforeEach(() => {
  jest.mocked(useAuth).mockReturnValue({
    user: { id: 'u1', name: 'Demo User', email: 'demo@example.com', createdAt: '' },
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  });
  jest.mocked(getFiles).mockReset();
  jest.mocked(deleteFile).mockReset();
});

it('shows a loading message while files are loading', () => {
  jest.mocked(getFiles).mockReturnValue(new Promise(() => {}));

  render(<Files />);

  expect(screen.getByText('Loading files...')).toBeInTheDocument();
});

it('shows an error when files cannot be loaded', async () => {
  jest.mocked(getFiles).mockRejectedValue(new Error('Network Error'));

  render(<Files />);

  expect(await screen.findByText('Unable to load files.')).toBeInTheDocument();
});

it('shows an empty message when there are no files', async () => {
  jest.mocked(getFiles).mockResolvedValue(listResponse([]));

  render(<Files />);

  expect(await screen.findByText('No files found.')).toBeInTheDocument();
});

it('removes a file only after the server confirms the delete', async () => {
  let confirmDelete: () => void = () => {};
  jest
    .mocked(getFiles)
    .mockResolvedValueOnce(listResponse([resume, notes]))
    .mockResolvedValueOnce(listResponse([notes]));
  jest.mocked(deleteFile).mockReturnValue(
    new Promise(resolve => {
      confirmDelete = () => resolve();
    })
  );

  render(<Files />);

  const row = (await screen.findByText('resume.pdf')).closest('tr') as HTMLElement;
  await userEvent.click(within(row).getByRole('button', { name: 'Delete' }));
  await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

  expect(deleteFile).toHaveBeenCalledWith('1');
  expect(screen.getByText('resume.pdf', { selector: 'td' })).toBeInTheDocument();

  confirmDelete();

  await waitForElementToBeRemoved(() => screen.queryByText('resume.pdf', { selector: 'td' }));
  expect(screen.getByText('notes.txt')).toBeInTheDocument();
});
