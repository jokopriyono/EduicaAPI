const Crypto = require('crypto');

const { auth } = require('../config');
const { cipherAlgorithm, cipherPassword } = auth;

function encrypt(text) {
  let iv = Crypto.randomBytes(16);
  let cipher = Crypto.createCipheriv(
    cipherAlgorithm,
    Buffer.from(cipherPassword),
    iv,
  );
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = Crypto.createDecipheriv(
    cipherAlgorithm,
    Buffer.from(cipherPassword),
    iv,
  );
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

module.exports = { decrypt, encrypt };
