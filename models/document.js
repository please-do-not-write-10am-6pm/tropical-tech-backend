'use strict'
import { Model } from 'sequelize'
export default (sequelize, DataTypes) => {
  class Document extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.userId = this.belongsTo(models.User, {
        foreignKey: 'userId'
      })
    }
  }
  Document.init(
    {
      url: DataTypes.STRING,
      typeOfId: DataTypes.STRING,
      countryOfIssue: DataTypes.STRING,
      issueDate: DataTypes.DATE,
      expireDate: DataTypes.DATE,
      number: DataTypes.STRING,
      userId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'Document'
    }
  )
  return Document
}
