// var express = require('express');
// var router = express.Router();

// /* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

// module.exports = router;
var express = require("express");
var router = express.Router();
var csrf = require("csurf");
var passport = require("passport");
var Order = require("../models/order");
var Cart = require("../models/cart");
var async = require("async");
var crypto = require("crypto");
var User = require("../models/user");
var randomstring = require("randomstring");
var nodemailer = require("nodemailer");

var csrfProtection = csrf();
//router.use(csrfProtection);

router.get("/profile", isLoggedIn, function(req, res, next) {
  Order.find({ user: req.user }, function(err, orders) {
    if (err) {
      console.log(err);
      return res.write("Error");
    }
    var cart;
    orders.forEach(function(order) {
      cart = new Cart(order.cart);
      order.items = cart.generateArray();
    });
    res.render("user/profile", {
      title: "Users",
      orders: orders,
      user: req.user
    });
  });
});

router.get("/logout", isLoggedIn, function(req, res, next) {
  if (req.session.admin == true) {
    req.session.admin = false;
  }
  req.logout();
  res.redirect("/");
});

router.get("/forget", function(req, res, next) {
  var messages = req.flash("error");
  res.render("user/forget", {
    title: "Sign Up",
    messages: messages,
    hasErrors: messages.length > 0
  });
});
router.post("/forget", function(req, res, next) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if (err) {
      req.flash("error", "Something Went Wrong!");
      res.redirect("/user/forget");
    } else if (!user) {
      req.flash("error", "This email doesnt exist. Re-enter!");
      res.redirect("/user/forget");
    } else {
      user.secretToken = randomstring.generate();
      console.log("email to:" + req.body.email);

      Email(req.body.email, user.secretToken);
      user.save();
      req.flash("error", "Please check your email!");
      res.redirect("/user/signin");
    }
  });
});
router.get("/reset/:username/:token", function(req, res) {
  var messages = req.flash("error");
  User.findOne({ email: req.params.username }, function(err, user) {
    if (err) {
      req.flash("error", "Something Went Wrong!");
      res.redirect("/paintings");
    } else {
      if (req.params.token == user.secretToken) {
        var username = req.params.username;
        var token = req.params.token;
        res.render("user/reset", {
          title: "Reset",
          messages: messages,
          username: username,
          token: token,
          hasErrors: messages.length > 0
        });
      } else {
        req.flash("error", "Link has expired!");
        res.redirect("/");
      }
    }
  });
});
router.post("/reset/:username/:token", function(req, res) {
  console.log(req.body.resetPassword);
  var messages = req.flash("error");
  User.findOne({ email: req.params.username }, function(err, user) {
    if (err) {
      req.flash("error", "Something Went Wrong!");
      res.redirect("/paintings");
    } else {
      if (req.params.token == user.secretToken) {
        if (
          req.body.resetPassword == req.body.rePassword &&
          req.body.resetPassword.length >= 8
        ) {
          user.secretToken = randomstring.generate();
          user.password = user.encryptPassword(req.body.resetPassword);
          user.save(function(err) {
            if (err) {
              req.flash("error", "Something Went Wrong!");
              res.redirect("/user/signin");
            } else {
              req.flash(
                "success",
                "Your password has been reset. Login to continue!"
              );
              res.redirect("/user/signin");44444
            }
          });
        } else {
          req.flash("error", "Incorrect Password");
          messages = req.flash("error");
          res.render("user/reset", {
            title: "Reset",
            messages: messages,
            username: req.params.username,
            token: req.params.token,
            hasErrors: messages.length > 0
          });
        }
      }
    }
  });
});
router.use("/", notLoggedIn, function(req, res, next) {
  next();
});

router.get("/signup", function(req, res, next) {
  var messages = req.flash("error");
  res.render("user/signup", {
    title: "Sign Up",
    messages: messages,
    hasErrors: messages.length > 0
  });
});

router.post(
  "/signup",
  passport.authenticate("local.signup", {
    failureRedirect: "/user/signup",
    failureFlash: true
  }),
  function(req, res, next) {
    console.log(req.body);
    if (req.body.password == req.body.confirmpassword) {
      if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
      } else {
        res.redirect("/user/profile");
      }
    } else {
      User.deleteOne({ email: req.body.email }, function(err, user) {
        if (err) {
          //console.log(err);
          req.flash("error", "Something Went Wrong!");
          res.redirect("/user/signup");
        } else {
          req.flash("error", "Passwords dont match!");
          res.redirect("/user/signup");
        }
      });
    }
  }
);

router.get("/signin", function(req, res, next) {
  var messages = req.flash("error");
  res.render("user/signin", {
    title: "Sign Up",
    messages: messages,
    hasErrors: messages.length > 0
  });
});

router.post(
  "/signin",
  passport.authenticate("local.signin", {
    failureRedirect: "/user/signin",
    failureFlash: true
  }),
  function(req, res, next) {
    if (req.session.oldUrl) {
      var oldUrl = req.session.oldUrl;
      req.session.oldUrl = null;
      res.redirect(oldUrl);
    } else {
      res.redirect("/user/profile");
    }
  }
);

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

function Email(email, message) {
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
    subject: "Forgot Password",
    text:
      "Hello " +
      email +
      '. Your password reset link is <a href="http://localhost:7000/user/reset/' +
      email +
      "/" +
      message +
      '">Reset Password<a>'
  };

  transporter.sendMail(HelperOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("The message has been sent!");
    }
  });
  return true;
}
