'use strict'
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Users', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    avatar_url: {
      type: Sequelize.STRING
    },
    firstName: {
      type: Sequelize.STRING
    },
    lastName: {
      type: Sequelize.STRING
    },
    birthDay: {
      type: Sequelize.DATE
    },
    phone: {
      type: Sequelize.STRING
    },
    username: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    addressL1: {
      type: Sequelize.STRING
    },
    addressL2: {
      type: Sequelize.STRING
    },
    state: {
      type: Sequelize.STRING
    },
    city: {
      type: Sequelize.STRING
    },
    postal: {
      type: Sequelize.STRING
    },
    documentUrl: {
      type: Sequelize.STRING
    },
    code: {
      type: Sequelize.INTEGER
    },
    actived: {
      type: Sequelize.BOOLEAN
    },
    token: {
      type: Sequelize.STRING
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  })

  await queryInterface.createTable('Answers', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    question1: {
      type: Sequelize.STRING
    },
    answer1: {
      type: Sequelize.STRING
    },
    question2: {
      type: Sequelize.STRING
    },
    answer2: {
      type: Sequelize.STRING
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'Cascade',
      onDelete: 'Cascade'
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  })
  await queryInterface.createTable('Documents', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    url: {
      type: Sequelize.STRING
    },
    typeOfId: {
      type: Sequelize.STRING
    },
    countryOfIssue: {
      type: Sequelize.STRING
    },
    issueDate: {
      type: Sequelize.DATE
    },
    expireDate: {
      type: Sequelize.DATE
    },
    number: {
      type: Sequelize.STRING
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'Cascade',
      onDelete: 'Cascade'
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  })
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.dropAllTables()
}
