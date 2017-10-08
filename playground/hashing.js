// const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

var saltvalue = '65782352';
var data = {
  id: 4
};

var token = jwt.sign(data, saltvalue);
console.log(token);

var decoded = jwt.verify(token +'1', saltvalue);
console.log('decoded' + JSON.stringify(decoded));

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