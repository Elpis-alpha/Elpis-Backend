const express = require('express')

const { errorHtml } = require('../middleware/errors')

const sendMail = require('../mail/sendMail')

const adminEmail = process.env.EMAIL_ADDRESS

const frontendLocation = process.env.FRONT_END_LOCATION

const siteName = process.env.SITE_NAME

const router = new express.Router()


router.get('/', async (req, res) => {

  res.render('index', {

    title: siteName,

    siteName, frontendLocation,

    complainLink: `/complain`,

  })

})

router.get('/complain', async (req, res) => {

  try {

    res.render('complain', {

      title: siteName,

      siteName, frontendLocation,

      title: siteName + " | Complaint"

    })

  } catch (e) {

    errorHtml(res, 500)

  }

})

router.post('/accept-complaint', async (req, res) => {

  try {

    if (req.body.content.trim() === "" || req.body.title.trim() === "") return errorHtml(res, 400)

    const mail = await sendMail(adminEmail, "A Complaint: " + req.body.title, req.body.content)

    if (mail.error) return errorHtml(res, 503)

    res.render('accept-complaint', {

      title: siteName,

      siteName, frontendLocation,

      title: siteName + " | Accepted"

    })

  } catch (e) {

    errorHtml(res, 500)

  }

})


module.exports = router
