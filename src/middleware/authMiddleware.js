const jwt = require('jsonwebtoken')
const User = require('../models/user')

const authMiddleware = {
  requireAuth: (req, res, next) => {
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
  },

  /**
   * Controlla l'utente connesso
   */
  checkUser: (req, res, next) => {
    const token = req.cookies.jwt

    if (token) {
      jwt.verify(token, "kibo's secret", async (err, decodedToken) => {
        if (err) {
          console.log(err.message)
          res.locals.user = null
          next()
        } else {
          console.log(decodedToken)
          let user = await User.findById(decodedToken.id)
          res.locals.user = user
          next()
        }
      })
    } else {
      res.locals.user = null
      next()
    }
  }
}

module.exports = authMiddleware
