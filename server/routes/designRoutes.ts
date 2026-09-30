import { Router } from 'express';
import {
  analyzeRoomController,
  generateDesignController,
  refineDesignController,
} from '../controllers/designController.js';

const router = Router();

router.post('/analyze', analyzeRoomController);
router.post('/generate', generateDesignController);
router.post('/refine', refineDesignController);

export default router;
