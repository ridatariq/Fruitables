var Product = require('../models/food');
var mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/shopping",{useNewUrlParser: true});

var done = 0;
for(var i = 0; i < products.length; i++)
{
    products[i].save(function(){
        done++;
        if(done === products.length)
        {
            exit();
        }
    });
}

function exit()
{
    mongoose.disconnect();
}
