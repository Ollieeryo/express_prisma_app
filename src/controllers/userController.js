const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const tokenSecretKey = process.env.JWT_SECRET_KEY


// 註冊、登入、權限不同
module.exports = {
  signIn: async(req, res) => {
    const { username, password } = req.body;

    try {
      const user = await prisma.users.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          role: true,
        },
      });
      
      // 確認使用者存不存在和密碼有無錯誤由 passport 來處理

      // 生成 JWT token
      const token = jwt.sign(user, tokenSecretKey, {
        expiresIn: '1d',
      });

      const data = {
        token,
        userId: user.id,
        userName: user.username,
        role: user.role,
        message: 'Login successful',
      }
  
      res.status(200).json(data);
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  // 建立一般使用者，權限 2
  signUp: async(req, res) => {
    const { username, password, confirmPassword } = req.body

    try {
      // 檢查用戶是否已存在
      const existingUser = await prisma.users.findUnique({
        where: { username },
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // 檢查密碼輸入是否相同
      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Password and confirmPassword must be same value' });
      }

      // 使用 bcrypt 對密碼進行哈希加密
      const hashedPassword = await bcrypt.hash(password, 10);

      // 創建新用戶
      const newUser = await prisma.users.create({
        data: {
          username: username,
          hashPassword: hashedPassword,
          role: 2, // 根據需求設置權限
        },
      });

      // 生成 JWT token
      const token = jwt.sign(
        { id: newUser.id, username: newUser.username, role: newUser.role },
        tokenSecretKey,
        {
          expiresIn: '1d',
        }
      );

      const data = {
        token,
        userId: newUser.id,
        userName: newUser.username,
        role: newUser.role,
      };

      res.status(201).json({ data, message: 'Registration successful' });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  updateUserInfo: async (req, res) => {
    const userId = parseInt(req.params.id)
    const { username, password } = req.body;

    try {
      // 查詢要更新的用户
      const user = await prisma.users.findUnique({
        where: { id: parseInt(userId) },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // 更新使用者帳密資料
      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: {
          username: username || user.username, //如果沒有提供新帳號，則保持原帳號
          hashPassword: password
            ? await bcrypt.hash(password, 10)
            : user.hashPassword, // 如果沒有提供新密碼，則保持原密碼
        },
      });

      res.status(200).json({
        userId: updatedUser.id,
        userName: updatedUser.username,
        message: 'User information updated',
      });
    } catch (error) {
      console.error('Error during user info update:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
}