'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
  const review = require ('../data/review.json').map((e)=>{
    delete e.id
    e.createdAt = e.updatedAt = new Date()
    return e
  })
  await queryInterface.bulkInsert("Reviews",review,{})
  },

  async down (queryInterface, Sequelize) {
  await queryInterface.bulkDelete("Reviews",null, {})
  }
};
