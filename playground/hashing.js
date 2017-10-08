// const {SHA256} = require('crypto-js');
// const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var saltvalue = '65782352';
var data = {
  id: 4
};
var password = '123abc!';

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
    console.log(hash);
  });
});

var hashedPassword = '$2a$10$0DSmLduxZgGzHQprAYgs7uiTFOenw/R4MxEM47w1DfG.xu.LRj9qO';

bcrypt.compare(password, hashedPassword, (err, res) => {
  console.log(res);
});

// var token = jwt.sign(data, saltvalue);
// console.log(token);

// var decoded = jwt.verify(token +'1', saltvalue);
// console.log('decoded' + JSON.stringify(decoded));

// var message = 'I am user number 3';
// var hash = SHA256(message).toString();

// console.log(`message: ${message}`);
// console.log(`hash: ${hash}`);

// var token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + saltvalue).toString()
// };

// // sample hack, no knowledge of the salt value so it fails
// // token.data.id = 5;
// // token.data.hash = SHA256(JSON.stringify(token.data)).toString();

// var resultHash = SHA256(JSON.stringify(token.data) + saltvalue).toString();
// if (resultHash == token.hash) {
//   console.log('Data was not changed');
// } else {
//   console.log('Data was changed, dont trust!');
// }