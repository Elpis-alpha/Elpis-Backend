const express = require('express')

const Payment = require('../models/Payment')

const { errorJson } = require('../middleware/errors')

const sendMail = require('../mail/sendMail')

const router = new express.Router()

const paymentPassword = process.env.PAYMENT_PASSWORD


// Sends post request to create new payment
router.post('/api/payment/create', async (req, res) => {

  const newPayment = new Payment(req.body)

  try {

    if (req.body.password !== paymentPassword) return errorJson(res, 401)

    await newPayment.save()
    
    await sendMail("elpis409@gmail.com", "Payment in portfolio", `Congrats Elpis, an amount of $${req.body.amount} was paid to you by ${req.body.name} for ${req.body.description}`)
    
    res.status(201).send(newPayment)

  } catch (error) {

    console.log(error);

    return errorJson(res, 400)

  }

})


// sends get request to fetch all payments
router.get('/api/payment/get-all', async (req, res) => {

  try {

    const payment = await Payment.find({})

    res.status(200).send(payment)

  } catch (error) {

    return errorJson(res, 400)

  }

})


// sends get request to fetch payment by id
router.get('/api/payment/get-one', async (req, res) => {

  const _id = req.query._id

  try {

    const payment = await Payment.findOne({ _id })

    res.status(200).send(payment)

  } catch (error) {

    return errorJson(res, 400)

  }

})


// sends get request to fetch payment by id
router.delete('/api/payment/delete-one', async (req, res) => {

  const _id = req.query._id

  try {

    if (req.body.password !== paymentPassword) return errorJson(res, 401)

    const payment = await Payment.findByIdAndDelete(_id)

    if (!payment) return errorJson(res, 404)

    res.status(200).send({ message: "payment deleted" })

  } catch (error) {

    return errorJson(res, 500)

  }

})


module.exports = router
