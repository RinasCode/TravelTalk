'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Review.belongsTo(models.Author, { foreignKey: "authorId" })
    }
  }
  Review.init({
    name: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notEmpty:{
          msg:"Name is required"
        },
        notNull:{
          msg:{
            msg: "Name is required"
          }
        }
      }
    },
    rate: {
      type:DataTypes.INTEGER,
      allowNull:false,
      validate:{
        notEmpty:{
          msg:"Rate is required"
        },
        notNull:{
          msg:{
            msg: "Rate is required"
          }
        }
      }
    },
    address: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notEmpty:{
          msg:"Address is required"
        },
        notNull:{
          msg:{
            msg: "Address is required"
          }
        }
      }
    },
    review: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notEmpty:{
          msg:"Review is required"
        },
        notNull:{
          msg:{
            msg: "Review is required"
          }
        }
      }
    },
    authorId: {
      type:DataTypes.INTEGER,
      allowNull:false,
      validate:{
        notEmpty:{
          msg:"AuthorId is required"
        },
        notNull:{
          msg:{
            msg: "AuthorId is required"
          }
        }
      }
    },
    image: {
      type:DataTypes.STRING,
      allowNull:false,
    }   
  }, {
    sequelize,
    modelName: 'Review',
  });
  return Review;
};