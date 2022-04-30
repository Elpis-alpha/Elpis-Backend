const jsonwebtoken = require('jsonwebtoken')

const Website = require('../models/Website')


const auth = async (req, res, next) => {

  try {

    const token = req.header('Authorization').replace('Bearer ', '')

    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET)

    const website = await Website.findOne({ _id: decoded._id, 'tokens.token':token })

    if (!website) throw new Error('Invalid Token')
      
    req.token = token

    req.website = website

    next()

  } catch (error) {

    res.status(401).send({ error: 'Not Authenticated' })

  }

}

module.exports = auth