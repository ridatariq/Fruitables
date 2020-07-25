var Blog = require('../models/blog');
var mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/shopping",{useNewUrlParser: true});

var blogs = [
    new Blog({
        title: "Soufflé Suissesse",
        image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-1.2.1&auto=format&fit=crop&w=931&q=80',
        body: "Ad aute ullamco do deserunt Lorem labore minim incididunt deserunt cupidatat aute.",
        created: {type: Date, default: Date.now}
    // }),
    // new Blog({
    //     imagePath: 'https://images.unsplash.com/photo-1528696353932-be229661fd48?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80',
    //     title: 'Filet de Maigre Parfumé',
    //     description: 'Stone Bass and Pastilla, Scented with Arabian Spices Fennel, Red Rice and Meat Jus',
    //     price: 10
    // }),
    // new Blog({
    //     imagePath: 'https://images.unsplash.com/photo-1518619745898-93e765966dcd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1105&q=80',
    //     title: 'Le Plateau de Fromages Affinés',
    //     description: 'Selection of French and British Farmhouse Cheese',
    //     price: 12
    })
];

var done = 0;
for(var i = 0; i < blogs.length; i++)
{
    blogs[i].save(function(){
        done++;
        if(done === blogs.length)
        {
            exit();
        }
    });
}

function exit()
{
    mongoose.disconnect();
}