'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Tokens', 'refreshToken', {
      type: Sequelize.STRING(500),
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Tokens', 'refreshToken', {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
  },
};
