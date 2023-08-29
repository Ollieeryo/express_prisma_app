const passport = require('../config/passport')

const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ status: 'error', message: 'unauthorized' });
    }
    req.user = user;
    next();
  })(req, res, next);
};

// const authenticatedAdmin = (req, res, next) => {
//   if (getUser(req) && (getUser(req).role === 1 )) return next()
//   return res.status(403).json({ status: 'error', message: 'permission denied' })
// }

// const authenticatedUser = (req, res, next) => {
//   if (getUser(req) && (getUser(req).role === '2')) return next()
//   return res.status(403).json({ status: 'error', message: 'permission denied' })
// }

// 辨認身分
const authenticatedRole = (req, res, next) => {
  const user = req.user
  if (user.role === 1 || user.role === 2) return next()
  return res.status(403).json({ status: 'error', message: 'role is not 1 or 2, permission denied' })
}

module.exports = {
  authenticateJWT,
  authenticatedRole
}