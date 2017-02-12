const crypto = require('crypto');

module.exports = (str, algo = 'sha256') => {
    if (!str) return '';
    const hash = crypto.createHash(algo);
    hash.update(str);
    return hash.digest('hex');
};
