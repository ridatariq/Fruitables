var express = require("express");
var nodemailer = require("nodemailer");
var router = express.Router();
var expressSanitizer = require("express-sanitizer");
var methodOverride = require("method-override");

router.use(methodOverride("_method"));
router.use(expressSanitizer());

var Product = require("../models/food");
var Cart = require("../models/cart");
var Order = require("../models/order");

////////////////////////////////////////
router.get("/check", function(req, res, next) {
  res.render("seating/index");
});

////////////////////////////////////////
router.get("/", function(req, res) {
  res.render("landing");
});


router.get("/bookings", function(req, res, next) {
  Seating.find({ user: req.user }, function(err, seatings) {
    if (err) {
      console.log(err);
      return res.write("Error");
    }
    var cart;
    seatings.forEach(function(seating) {
      seating = new Seating();
      order.items = cart.generateArray();
    });
    res.render("user/profile", {
      title: "Users",
      seatings: seatings,
      user: req.user
    });
  });
});


router.post("/getintouch", function(req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var message = req.body.message;
  var check = getInTouch(email, name, message);
  res.redirect("/");
});
////////////////////////////////////////
/* GET home page. */
router.get("/menu", function(req, res, next) {
  var successMsg = req.flash("success")[0];
  Product.find(function(err, docs) {
    if (err) {
      console.log(err);
    } else {
      var productChunks = [];
      var chunkSize = 3;
      for (var i = 0; i < docs.length; i += chunkSize) {
        productChunks.push(docs.slice(i, i + chunkSize));
      }
      res.render("shop/index", {
        title: "Express",
        products: productChunks,
        successMsg: successMsg,
        noMessages: !successMsg
      });
    }
  });
});

router.get("/new", isAdmin, function(req, res, next) {
  res.render("shop/new", {
    title: "New Item"
  });
});

router.post("/new", function(req, res, next) {
  Product.create(req.body.product, function(err, newBlog) {
    if (err) {
      res.render("new");
    } else {
      res.redirect("/menu");
    }
  });
});

router.delete("/:id", function(req, res) {
  Product.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.redirect("/profile");
    } else {
      res.redirect("/menu");
    }
  });
});

router.get("/:id/edit", function(req, res, next) {
  console.log(req.body);
  Product.findById(req.params.id, function(err, foundProduct) {
    if (err) {
      res.redirect("/menu");
    } else {
      res.render("shop/edit", {
        title: "Edit " + foundProduct.title,
        product: foundProduct
      });
    }
  });
});

router.get("/:id/show", function(req, res, next) {
  res.render("shop/show", {
    title: "Show",
    what: "What"
  });
});

router.put("/:id", function(req, res) {
  Product.findByIdAndUpdate(req.params.id, req.body.product, function(
    err,
    updatedProduct
  ) {
    if (err) {
      res.redirect("/menu");
    } else {
      res.redirect("/menu");
    }
  });
});

router.get("/add-to-cart/:id", function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  Product.findById(productId, function(err, product) {
    req.flash("success", product.title + " added To Cart!");
    if (err) {
      return res.redirect("/menu");
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    res.redirect("/menu");
  });
});

router.get("/reduce/:id", function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect("/shopping-cart");
});

router.get("/add/:id", function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.addByOne(productId);
  req.session.cart = cart;
  res.redirect("/shopping-cart");
});

router.get("/remove/:id", function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.removeItem(productId);
  req.session.cart = cart;
  var size = Object.size(req.session.cart);
  console.log(size);
  if (req.session.cart.items.size == 0) {
    res.redirect("/menu");
  } else {
    res.redirect("/shopping-cart");
  }
});

router.get("/shopping-cart", function(req, res, next) {
  if (!req.session.cart) {
    return res.render("shop/shopping-cart", { products: null });
  }
  var cart = new Cart(req.session.cart);
  res.render("shop/shopping-cart", {
    title: "Cart",
    products: cart.generateArray(),
    totalPrice: cart.totalPrice
  });
});

router.get("/checkout", isLoggedIn, function(req, res, next) {
  if (!req.session.cart) {
    return res.redirect("/shopping-cart");
  }
  var cart = new Cart(req.session.cart);

  var errMsg = req.flash("error")[0];
  res.render("shop/checkout", {
    title: "Checkout",
    total: cart.totalPrice,
    errMsg: errMsg,
    noError: !errMsg
  });
});

router.post("/checkout", isLoggedIn, function(req, res, next) {
  if (!req.session.cart) {
    return res.redirect("/shopping-cart");
  }
  var cart = new Cart(req.session.cart);
  var stripe = require("stripe")("sk_test_wJ00yg9taUbdNikLG1SFkiDv00z90J1mO4");
  stripe.charges.create(
    {
      amount: cart.totalPrice * 100,
      currency: "usd",
      source: req.body.stripeToken, // obtained with Stripe.js
      description: "Test charge"
    },
    function(err, charge) {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("/checkout");
      }
      var order = new Order({
        user: req.user,
        cart: cart,
        address: req.body.address,
        name: req.body.name,
        paymentId: charge.id
      });
      var message = "";
      var products = cart.generateArray();
      products.forEach(function(item) {
        message =
          message + item.item.title + " for " + item.item.price + " each";
        var count;
        count++;
      });
      var check = sendEmail(order, message);
      order.save(function(err, result) {
        req.flash("success", "Successfully placed order!");
        req.session.cart = null;
        res.redirect("/menu");
      });
    }
  );
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect("/user/signin");
}

function isAdmin(req, res, next) {
  if (req.session.admin == true) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect("/user/signin");
}

function Reserve(email, name, message, date) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false,
    port: 25,
    auth: {
      user: "Fruitablesstore@gmail.com",
      pass: "fastproject"
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  let HelperOptions = {
    from: '"Fruitables" <Fruitablesstore@gmail.com',
    to: email,
    subject: "Seat Booking",
    text:
      "Hello " +
      name +
      ". We got your booking for the date " +
      date +
      " which " +
      message +
      " and our team will get in touch as soon as possible."
  };

  transporter.sendMail(HelperOptions, (error, info) => {
    if (error) {
      console.log(error);
    }
    console.log("The message has been sent!");
  });
  return true;
}

function getInTouch(email, name, message) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false,
    port: 25,
    auth: {
      user: "Fruitablesstore@gmail.com",
      pass: "fastproject"
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  let HelperOptions = {
    from: '"Fruitables" <Fruitablesstore@gmail.com',
    to: email,
    subject: "Get In Touch",
    text:
      "Hello " +
      name +
      ". We got your query ' " +
      message +
      " ' and our team will get in touch as soon as possible."
  };

  transporter.sendMail(HelperOptions, (error, info) => {
    if (error) {
      console.log(error);
    }
    console.log("The message has been sent!");
  });
  return true;
}

function sendEmail(order, message) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false,
    port: 25,
    auth: {
      user: "Fruitablesstore@gmail.com",
      pass: "fastproject"
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  let HelperOptions = {
    from: '"Fruitables" <Fruitablesstore@gmail.com',
    to: order.user.email,
    subject: "Order Details",
    text:
      "Hello " +
      order.user.email +
      ". Fruitables has recieved your order of " +
      order.cart.totalPrice +
      message
  };

  transporter.sendMail(HelperOptions, (error, info) => {
    if (error) {
      console.log(error);
    }
    console.log("The message has been sent!");
  });
  return true;
}

Object.size = function(obj) {
  var size = 0,
    key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};
