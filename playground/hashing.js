const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let password = '123abc!';

bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
        console.log(hash);
    })
});

const hashedPassword = '$2a$10$I2ScVbtc3HyZQDzAqbdlZeZ0CMq6PX5JBMlLUm/W8wmA5xA4gk4XS';

bcrypt.compare('password', hashedPassword, (err, res) => {
    console.log(res);
});

// const data = {
//     id: 10
// };

// const token = jwt.sign(data, '123abc');

// console.log(token);

// const decoded = jwt.verify(token,'123abc');

// console.log(decoded);

// const message = 'I am user number 3';
// var hash = SHA256(message).toString();

// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);

// const data = {
//     id: 4
// };

// let token = {
//     data,
//     hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// };

// token.data.id = 5;

// const resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();

// if (resultHash === token.hash) {
//     console.log('Data was not changed');
// } else {
//     console.log('Data was changed. Do not trust');
// }

