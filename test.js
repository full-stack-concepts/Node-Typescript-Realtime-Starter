const https = require("https");
const querystring = require("querystring");

const postData = var  querystring.stringify({
    firstName: "John",
    lastName: "Doe",
    email:"johndoe@gmail.com",
    password:"Aabvb@3459083453098_____"
});







/*
'use strict';

const crypto = require('crypto');
const randomString = require('random-string')

const cryptoKey = randomString({
  length: 32,
    numeric: true,
    letters: true,
    special: false,
    exclude: ['a', 'b', '1']
});



function encrypt(text) {
  let iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv('aes-256-cbc', new Buffer(cryptoKey), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  let textParts = text.split(':');
  let iv = new Buffer(textParts.shift(), 'hex');
  let encryptedText = new Buffer(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', new Buffer(cryptoKey), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}


const hash = encrypt("12345678")
console.log(hash)
const pw = decrypt(hash)
console.log(pw)

*/

/*

var crypto = require("crypto")

function encrypt(key, data) {
        var cipher = crypto.createCipher('aes-256-cbc', key);
        var crypted = cipher.update(text, 'utf-8', 'hex');
        crypted += cipher.final('hex');

        return crypted;
}

function decrypt(key, data) {
        var decipher = crypto.createDecipher('aes-256-cbc', key);
        var decrypted = decipher.update(data, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');

        return decrypted;
}

var key = "supersecretkey";
var text = "123|a123123123123123";
console.log("Original Text: " + text);

var encryptedText = encrypt(key, text);
console.log("Encrypted Text: " + encryptedText);
var decryptedText = decrypt(key, encryptedText);
console.log("Decrypted Text: " + decryptedText);

*/