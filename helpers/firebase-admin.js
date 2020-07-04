'use strict';

const admin = require('firebase-admin');

const serviceAccount = require('./firebase-secret.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://tracking-karyawan.firebaseio.com',
});

console.log('Firebase Admin Initialized');

module.exports = admin;
