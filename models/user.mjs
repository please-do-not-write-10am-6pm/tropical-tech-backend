'use strict'
import { Model } from 'sequelize'
export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      avatar_url: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      birthDay: DataTypes.DATE,
      phone: DataTypes.STRING,
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      addressL1: DataTypes.STRING,
      addressL2: DataTypes.STRING,
      state: DataTypes.STRING,
      city: DataTypes.STRING,
      postal: DataTypes.STRING,
      documentUrl: DataTypes.STRING,
      code: DataTypes.INTEGER,
      actived: DataTypes.BOOLEAN,
      token: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'User'
    }
  )
  return User
}
