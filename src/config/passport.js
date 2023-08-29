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

module.exports = passport;
