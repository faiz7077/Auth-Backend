const xss = require('xss');
module.exports = (input) => xss(input.trim());