const UserController= require('../controllers/user-controller');
const Router = require('express').Router;
const router = new Router();
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');

router.post('/registration',
    body('firstName').isLength({ min: 2 }),
    body('lastName').isLength({ min: 2 }),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    UserController.registration
);
router.post('/login', UserController.login);
router.post('/logout', UserController.logout);
router.get('/activate/:link', UserController.activate);
router.get('/refresh', UserController.refresh);
router.get('/users', authMiddleware, UserController.getUsers);

module.exports = router;