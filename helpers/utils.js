exports.toBase64 = string => Buffer.from(string).toString('base64');

exports.fromBase64 = string => Buffer.from(string, 'base64').toString('ascii');
