const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:String,
   category:String,
   price:Number,
   total:Number,
   sold: {
    type: Number,
    default: 0
  }

});

module.exports= mongoose.model('Product',productSchema);