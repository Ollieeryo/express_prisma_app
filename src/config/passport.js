const passport = require('passport');
const LocalStrategy = require('passport-local');
const passportJWT = require('passport-jwt');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },
  async (username, password, cb) => {
    try {
      const user = await prisma.users.findUnique({
        where: { username }
      });
      
      if (!user) {
        return cb(Error('帳號不存在'), false);
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.hashPassword);

      if (!isPasswordCorrect) {
        return cb(Error('密碼錯誤'), false);
      }

      return cb(null, user);
    } catch (error) {
      return cb(error);
    }
  }
));

const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY
};

passport.use(new JWTStrategy(jwtOptions, async (jwtPayload, cb) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: jwtPayload.id }
    });

    return cb(null, user);
  } catch (error) {
    return cb(error);
  }
}));

// 看看是不是要建立一個 middleware 檔案來使用
// 自定義的中間件，確保只有用戶自己可以修改帳號資訊
// function ensureUserIsAuthorized(req, res, next) {
//   // 在 Passport 認證之後，已驗證的用戶數據將存儲在 req.user 中
//   const authenticatedUserId = req.user.id; // 從已驗證的用戶數據中獲取用戶ID
//   const userIdToUpdate = req.body.userId; // 從請求中獲取要修改的用戶ID

//   if (authenticatedUserId !== userIdToUpdate) {
//     return res.status(403).json({ message: 'You are not authorized to perform this action' });
//   }

//   next();
// }

module.exports = passport;
