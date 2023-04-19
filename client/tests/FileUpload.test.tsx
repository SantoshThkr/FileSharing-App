import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileUpload from '../src/components/FileUpload';
import { uploadFile } from '../src/services/fileApi';

jest.mock('../src/services/fileApi');

const user = userEvent.setup({ applyAccept: false });

beforeEach(() => {
  jest.mocked(uploadFile).mockReset();
});

it('shows the selected file name and size', async () => {
  render(<FileUpload onUploaded={jest.fn()} />);

  await user.upload(
    screen.getByLabelText('Choose file'),
    new File(['a'.repeat(2048)], 'resume.pdf')
  );

  expect(screen.getByText('resume.pdf (2 KB)')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Upload File' })).toBeEnabled();
});

it('rejects unsupported file types before uploading', async () => {
  render(<FileUpload onUploaded={jest.fn()} />);

  await user.upload(screen.getByLabelText('Choose file'), new File(['MZ'], 'setup.exe'));

  expect(screen.getByText('This file type is not supported.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Upload File' })).toBeDisabled();
});

it('rejects files larger than 10 MB', async () => {
  const bigFile = new File(['x'], 'video.zip');
  Object.defineProperty(bigFile, 'size', { value: 11 * 1024 * 1024 });
  render(<FileUpload onUploaded={jest.fn()} />);

  await user.upload(screen.getByLabelText('Choose file'), bigFile);

  expect(screen.getByText('File is larger than 10 MB.')).toBeInTheDocument();
  expect(uploadFile).not.toHaveBeenCalled();
});

it('uploads the file and reports success', async () => {
  const onUploaded = jest.fn();
  let finishUpload: () => void = () => {};
  jest.mocked(uploadFile).mockImplementation((_file, onProgress) => {
    onProgress?.(40);
    return new Promise(resolve => {
      finishUpload = () => resolve({} as never);
    });
  });
  render(<FileUpload onUploaded={onUploaded} />);

  await user.upload(screen.getByLabelText('Choose file'), new File(['hello'], 'notes.txt'));
  await user.click(screen.getByRole('button', { name: 'Upload File' }));

  expect(screen.getByRole('button', { name: 'Uploading...' })).toBeDisabled();
  expect(screen.getByText('40%')).toBeInTheDocument();

  finishUpload();

  expect(await screen.findByText('notes.txt uploaded successfully.')).toBeInTheDocument();
  expect(onUploaded).toHaveBeenCalled();
});

it('shows an error when the upload fails', async () => {
  jest.mocked(uploadFile).mockRejectedValue(new Error('Network Error'));
  render(<FileUpload onUploaded={jest.fn()} />);

  await user.upload(screen.getByLabelText('Choose file'), new File(['hello'], 'notes.txt'));
  await user.click(screen.getByRole('button', { name: 'Upload File' }));

  expect(await screen.findByText('Upload failed. Please try again.')).toBeInTheDocument();
});
