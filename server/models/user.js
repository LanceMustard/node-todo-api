const mongoose = require('mongoose');
const validator = require('validator');

// var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
// var validateEmail = function(email) {
//   return emailRegex.test(email);
// };

var User = mongoose.model('User', {
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    // validate: validateEmail,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    },
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  token: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

module.exports = {User};

