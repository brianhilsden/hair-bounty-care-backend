import { Router } from 'express';
import { BlogController } from '../controllers/blog.controller';

const router = Router();
const blogController = new BlogController();

router.get('/categories', (req, res, next) => blogController.getCategories(req, res, next));
router.get('/', (req, res, next) => blogController.getPosts(req, res, next));
router.get('/:slug', (req, res, next) => blogController.getPost(req, res, next));

export default router;
