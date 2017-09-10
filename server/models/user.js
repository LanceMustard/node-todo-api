var mongoose = require('mongoose');
var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

var validateEmail = function(email) {
  return emailRegex.test(email);
};

var User = mongoose.model('User', {
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    validate: validateEmail
  }
});

module.exports = {User};