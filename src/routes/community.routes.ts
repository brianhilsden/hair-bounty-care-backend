import { Router } from 'express';
import { CommunityController } from '../controllers/community.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const communityController = new CommunityController();

// All routes require auth
router.use(authenticate);

// Groups
router.get('/groups', (req, res, next) => communityController.getGroups(req, res, next));
router.get('/groups/:id', (req, res, next) => communityController.getGroup(req, res, next));
router.post('/groups/:id/join', (req, res, next) => communityController.joinGroup(req, res, next));
router.post('/groups/:id/leave', (req, res, next) => communityController.leaveGroup(req, res, next));

// Posts
router.get('/groups/:id/posts', (req, res, next) => communityController.getGroupPosts(req, res, next));
router.post('/groups/:id/posts', (req, res, next) => communityController.createPost(req, res, next));
router.post('/posts/:postId/like', (req, res, next) => communityController.likePost(req, res, next));

// Chat
router.get('/chat/:id/messages', (req, res, next) => communityController.getMessages(req, res, next));
router.post('/chat/:id/messages', (req, res, next) => communityController.sendMessage(req, res, next));

export default router;
