const express = require('express')

const User = require('../models/User')

const auth = require('../middleware/auth')

const { errorJson } = require('../middleware/errors')

const router = new express.Router()


// Sends post request to create new user
router.post('/api/users', async (req, res) => {

  const newUser = User(req.body)

  try {

    await newUser.save()

    const token = await newUser.generateAuthToken()

    const verifyUser = await newUser.sendVerificationEmail()

    res.status(201).send({ user: newUser, token })

  } catch (error) {

    return errorJson(res, 400)

  }

})


// Sends post request to log user in
router.post('/api/users/login', async (req, res) => {

  const userData = User(req.body)

  try {

    const user = await User.findbyCredentials(userData.email, userData.password)

    const token = await user.generateAuthToken()

    res.status(200).send({ user, token })

  } catch (error) {

    return errorJson(res, 400)

  }

})


// Sends post request to log user out
router.post('/api/users/logout', auth, async (req, res) => {

  try {

    req.user.tokens = req.user.tokens.filter(item => item.token != req.token)

    await req.user.save()

    res.status(200).send({ message: 'Logout Successful' })

  } catch (error) {

    return errorJson(res, 500)

  }

})


// Sends post request to log user out
router.post('/api/users/logout/all', auth, async (req, res) => {

  try {

    req.user.tokens = []

    await req.user.save()

    res.status(200).send({ message: 'Logout Successful' })

  } catch (error) {

    return errorJson(res, 500)

  }

})


// sends get request to fetch auth user
router.get('/api/users/user', auth, async (req, res) => {

  res.send(req.user)

})


// sends get request to fetch user by id
router.get('/api/users/id/:id', async (req, res) => {

  const _id = req.params.id

  try {

    const user = await User.findById(_id)

    if (!user) return errorJson(res, 404)

    res.send(user.toPublicJSON())

  } catch (e) {

    return errorJson(res, 500)

  }

})


// sends get request to fetch user by email
router.get('/api/users/email/:email', async (req, res) => {

  const email = req.params.email

  try {

    const user = await User.findOne({ email: email })

    if (!user) return errorJson(res, 404)

    res.send(user.toPublicJSON())

  } catch (e) {

    return errorJson(res, 500)

  }

})


// Sends patch request to update users
router.patch('/api/users/user', auth, async (req, res) => {

  const updates = Object.keys(req.body)

  const allowedUpdate = ['name', 'email', 'password', 'age']

  const isValidOp = updates.every(item => allowedUpdate.includes(item))

  if (!isValidOp) return res.status(400).send({ error: 'Invalid Updates', allowedUpdates: allowedUpdate })

  try {

    // Because of password middleware
    const user = req.user

    updates.forEach(item => user[item] = req.body[item])

    await user.save()

    // const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })

    res.status(201).send(user)

  } catch (error) {

    return errorJson(res, 500)

  }

})


// Sends patch request to change password
router.post('/api/users/user/password', auth, async (req, res) => {

  try {

    // Because of password middleware
    const user = req.user

    const _user = await User.findbyCredentials(user.email, req.body.oldPassword)

    user.password = req.body.newPassword

    await user.save()

    res.status(201).send(user)

  } catch (error) {

    return errorJson(res, 400)

  }

})


// Sends delete request to delete users
router.delete('/api/users/user', auth, async (req, res) => {

  try {

    const user = req.user

    await user.sendExitEmail()

    await User.deleteOne({ _id: user._id })

    res.send({ message: 'user deleted' })

  } catch (error) {

    return errorJson(res, 500)

  }

})


module.exports = router
