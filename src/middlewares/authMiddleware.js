const jwt = require('jsonwebtoken')

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt

  // Check jwt exists & is verified
  if (token) {
    jwt.verify(token, "kibo's secret", (err, decodedToken) => {
      if (err) {
        console.log(err.message)
        res.status(301).json({ path: '/login' })
      } else {
        console.log(decodedToken)
        next()
      }
    })
  } else {
    res.status(301).json({ path: '/login' })
  }
}

module.exports = requireAuth
