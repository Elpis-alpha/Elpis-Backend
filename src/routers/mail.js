const express = require('express')

const sendMail = require('../mail/sendMail')

const { errorJson } = require('../middleware/errors')

const auth = require('../middleware/auth')

const router = new express.Router()


router.post('/api/mail/send', auth, async (req, res) => {

  const mailAddress = req.body.address

  const mailSubject = req.body.title

  const mailBody = req.body.content

  try {

    const mail = await sendMail(mailAddress, mailSubject, mailBody)

    if (mail.error) return errorJson(res, 503)

    res.status(201).send({ message: 'sent' })

  } catch (error) {

    errorJson(res, 500)

  }

})

module.exports = router

