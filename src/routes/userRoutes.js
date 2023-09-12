const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();
const passport = require('../config/passport');
const { authenticateJWT, authenticatedRole } = require('../middleware/auth');

// 先在 local 用 bcrypt 進行 hash 密碼比對驗證(使用者輸入、資料庫)，因為登入時沒有 JWT 所以不需要驗證 
router.post('/signin', passport.authenticate('local', { session: false }),  authenticatedRole, userController.signIn)
router.post('/signup', userController.signUp)
router.patch('/users/:id',authenticateJWT, authenticatedRole, userController.updateUserInfo)

module.exports = router;