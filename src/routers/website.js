const express = require('express')

const Website = require('../models/Website')

const auth = require('../middleware/auth')

const { errorJson } = require('../middleware/errors')

const router = new express.Router()


// Sends post request to create new website
router.post('/api/websites', async (req, res) => {

  const newWebsite = Website(req.body)

  try {

    await newWebsite.save()

    const token = await newWebsite.generateAuthToken()

    res.status(201).send({ website: newWebsite, token })

  } catch (error) {

    return errorJson(res, 400)

  }

})


// Sends post request to log website in
router.post('/api/websites/login', async (req, res) => {

  const websiteData = Website(req.body)

  try {

    const website = await Website.findbyCredentials(websiteData.email, websiteData.password)

    const token = await website.generateAuthToken()

    res.status(200).send({ website, token })

  } catch (error) {

    return errorJson(res, 400)

  }

})


// Sends post request to log website out
router.post('/api/websites/logout', auth, async (req, res) => {

  try {

    req.website.tokens = req.website.tokens.filter(item => item.token != req.token)

    await req.website.save()

    res.status(200).send({ message: 'Logout Successful' })

  } catch (error) {

    return errorJson(res, 500)

  }

})


// Sends post request to log website out
router.post('/api/websites/logout/all', auth, async (req, res) => {

  try {

    req.website.tokens = []

    await req.website.save()

    res.status(200).send({ message: 'Logout Successful' })

  } catch (error) {

    return errorJson(res, 500)

  }

})


// sends get request to fetch auth website
router.get('/api/websites/website', auth, async (req, res) => {

  res.send(req.website)

})


// Sends patch request to update websites
router.patch('/api/websites/website', auth, async (req, res) => {

  const updates = Object.keys(req.body)

  const allowedUpdate = ['name', 'email', 'password', 'age']

  const isValidOp = updates.every(item => allowedUpdate.includes(item))

  if (!isValidOp) return res.status(400).send({ error: 'Invalid Updates', allowedUpdates: allowedUpdate })

  try {

    // Because of password middleware
    const website = req.website

    updates.forEach(item => website[item] = req.body[item])

    await website.save()

    // const website = await Website.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })

    res.status(201).send(website)

  } catch (error) {

    return errorJson(res, 500)

  }

})


// Sends patch request to change password
router.post('/api/websites/website/password', auth, async (req, res) => {

  try {

    // Because of password middleware
    const website = req.website

    const _website = await Website.findbyCredentials(website.email, req.body.oldPassword)

    website.password = req.body.newPassword

    await website.save()

    res.status(201).send(website)

  } catch (error) {

    return errorJson(res, 400)

  }

})


// Sends delete request to delete websites
router.delete('/api/websites/website', auth, async (req, res) => {

  try {

    const website = req.website

    await website.sendExitEmail()

    await Website.deleteOne({ _id: website._id })

    res.send({ message: 'website deleted' })

  } catch (error) {

    return errorJson(res, 500)

  }

})


module.exports = router
