'use strict';
const { hash } = require('../helpers/bcrypt');
const author = require('../models/author');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
  const author = require('../data/author.json').map((e) =>{
    delete e.id
    e.password = hash(e.password)
    e.createdAt=e.updatedAt = new Date ()
    return e
  })
  await queryInterface.bulkInsert("Authors",author,{})
  },

  async down (queryInterface, Sequelize) {
  await queryInterface.bulkDelete("Authors",null,{})
  }
};
