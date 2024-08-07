const bcrypt = require("bcryptjs");

function hash(pass) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(pass, salt);
}

function comparePassword(pass, hashedPass) {
  return bcrypt.compareSync(pass, hashedPass);
}

module.exports = { hash, comparePassword };
