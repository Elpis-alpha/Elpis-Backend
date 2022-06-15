const mongoose = require('mongoose')


// Sets up payment schema
const paymentSchemer = new mongoose.Schema({

  name: {

    type: String,

    required: true,

    trim: true,

  },

  description: {

    type: String,

    required: true,

    trim: true,

  },

  amount: {

    type: String,

    trim: true,

    required: true,

  },

  orderID: {

    type: String,

    required: true,

  },

}, { timestamps: true });



// Create Payment Model
const Payment = mongoose.model('Payment', paymentSchemer)


module.exports = Payment
