const mongoose = require('mongoose')

const validator = require('validator')

const bcryptjs = require('bcryptjs')

const jsonwebtoken = require('jsonwebtoken');


// Sets up website schema
const websiteSchemer = new mongoose.Schema({

  name: {

    type: String,

    required: true,

    trim: true,

  },

  password: {

    type: String,

    trim: true,

    required: true,

    minlength: 7,

    validate(value) {

      if (value.toLowerCase().includes('password')) {

        throw new Error('Password must not include "password"')

      }

    },

  },

  tokens: [

    {

      token: {

        type: String,

        required: true

      }

    }

  ],

}, { timestamps: true });



// Generate Authentication Token
websiteSchemer.methods.generateAuthToken = async function () {

  const website = this

  const token = jsonwebtoken.sign({ _id: website.id.toString() }, process.env.JWT_SECRET, {})

  website.tokens = website.tokens.concat({ token })

  await website.save()

  return token

}


// Private profile
websiteSchemer.methods.toJSON = function () {

  const website = this

  const returnWebsite = website.toObject()

  returnWebsite.verify = returnWebsite.verify === "true"
  
  delete returnWebsite.password
  
  delete returnWebsite.tokens

  delete returnWebsite.avatar

  delete returnWebsite.avatarSmall

  return returnWebsite

}


// Public profile
websiteSchemer.methods.toPublicJSON = function () {

  const website = this

  const returnWebsite = website.toObject()

  delete returnWebsite.password

  delete returnWebsite.tokens

  return returnWebsite

}


// For login
websiteSchemer.statics.findbyCredentials = async (email, password) => {

  const website = await Website.findOne({ email })

  if (!website) throw new Error('Unable to login')

  const isMatch = await bcryptjs.compare(password, website.password)

  if (!isMatch) throw new Error('Unable to login')

  return website

}


// Hash password
websiteSchemer.pre('save', async function (next) {

  const website = this

  if (website.isModified('password')) website.password = await bcryptjs.hash(website.password, 8)

  next()

})



// Create Website Model
const Website = mongoose.model('Website', websiteSchemer)


module.exports = Website
