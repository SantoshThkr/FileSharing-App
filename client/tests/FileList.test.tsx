import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileList from '../src/components/FileList';
import { UserFile } from '../src/types/file';

const files: UserFile[] = [
  {
    id: '1',
    originalName: 'resume.pdf',
    mimeType: 'application/pdf',
    size: 250880,
    createdAt: '2023-10-02T10:00:00.000Z',
  },
  {
    id: '2',
    originalName: 'photo.jpg',
    mimeType: 'image/jpeg',
    size: 1258291,
    createdAt: '2023-10-05T10:00:00.000Z',
  },
];

function getRow(name: string) {
  return screen.getByText(name).closest('tr') as HTMLElement;
}

it('shows file name, type and size', () => {
  render(<FileList files={files} onDownload={jest.fn()} onDelete={jest.fn()} />);

  const row = getRow('photo.jpg');
  expect(within(row).getByText('JPG')).toBeInTheDocument();
  expect(within(row).getByText('1.2 MB')).toBeInTheDocument();
  expect(within(getRow('resume.pdf')).getByText('245 KB')).toBeInTheDocument();
});

it('calls onDownload with the selected file', async () => {
  const onDownload = jest.fn();
  render(<FileList files={files} onDownload={onDownload} onDelete={jest.fn()} />);

  await userEvent.click(within(getRow('resume.pdf')).getByRole('button', { name: 'Download' }));

  expect(onDownload).toHaveBeenCalledWith(files[0]);
});

it('asks for confirmation before deleting', async () => {
  const onDelete = jest.fn().mockResolvedValue(undefined);
  render(<FileList files={files} onDownload={jest.fn()} onDelete={onDelete} />);

  await userEvent.click(within(getRow('resume.pdf')).getByRole('button', { name: 'Delete' }));

  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveTextContent('Delete "resume.pdf"?');

  await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(onDelete).not.toHaveBeenCalled();
});

it('deletes the file after confirming', async () => {
  const onDelete = jest.fn().mockResolvedValue(undefined);
  render(<FileList files={files} onDownload={jest.fn()} onDelete={onDelete} />);

  await userEvent.click(within(getRow('photo.jpg')).getByRole('button', { name: 'Delete' }));
  await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

  expect(onDelete).toHaveBeenCalledWith(files[1]);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('keeps the dialog open when deleting fails', async () => {
  const onDelete = jest.fn().mockRejectedValue(new Error('Server error'));
  render(<FileList files={files} onDownload={jest.fn()} onDelete={onDelete} />);

  await userEvent.click(within(getRow('photo.jpg')).getByRole('button', { name: 'Delete' }));
  await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

  expect(await screen.findByText('Unable to delete file. Please try again.')).toBeInTheDocument();
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
