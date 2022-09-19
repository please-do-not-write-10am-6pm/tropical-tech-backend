/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

import { readdirSync } from 'fs'
import { basename as _basename, join } from 'path'
import Sequelize, { DataTypes } from 'sequelize'
// eslint-disable-next-line no-undef
const basename = _basename(__filename)
// eslint-disable-next-line no-undef
const env = process.env.NODE_ENV || 'production'
// eslint-disable-next-line no-undef
const config = require(__dirname + '/../config/config.json')[env]
const db = {}

let sequelize
if (config.use_env_variable) {
  // eslint-disable-next-line no-undef
  sequelize = new Sequelize(process.env[config.use_env_variable], config)
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config)
}

// eslint-disable-next-line no-undef
readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
  })
  .forEach((file) => {
    // eslint-disable-next-line no-undef
    const model = require(join(__dirname, file))(sequelize, DataTypes)
    db[model.name] = model
  })

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

export default db
