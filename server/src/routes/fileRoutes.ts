import { Router } from 'express';
import {
  deleteFile,
  downloadFile,
  getFile,
  getFiles,
  uploadFile,
} from '../controllers/fileController';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(requireAuth);

router.get('/', getFiles);
router.post('/', upload.single('file'), uploadFile);
router.get('/:id', getFile);
router.get('/:id/download', downloadFile);
router.delete('/:id', deleteFile);

export default router;
