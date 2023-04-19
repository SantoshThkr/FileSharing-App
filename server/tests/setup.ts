import os from 'os';
import path from 'path';

process.env.JWT_SECRET = 'test-secret';
process.env.UPLOAD_DIR = path.join(os.tmpdir(), 'file-sharing-test-uploads');
