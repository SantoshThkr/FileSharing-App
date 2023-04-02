import { Router } from 'express';
import { uploadFile } from '../controllers/fileController';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(requireAuth);

router.post('/', upload.single('file'), uploadFile);

export default router;
