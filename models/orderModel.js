const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId : {type:mongoose.Schema.Types.ObjectId, 
        ref:'User'
    },

    products: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required: true 
      }],

        totalPrice:Number,
        
        orderDate: {
            type: Date,
            default: Date.now  
          }

});

module.exports= mongoose.model('Order',orderSchema);