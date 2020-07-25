var passport = require("passport");
var nodemailer = require("nodemailer");
var User = require("../models/user");
var LocalStrategy = require("passport-local").Strategy;

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(
  "local.signup",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true
    },
    function(req, email, password, done) {
      req
        .checkBody("email", "Invalid Email")
        .notEmpty()
        .isEmail();
      req
        .checkBody("password", "Password length should be 8 charcters.")
        .notEmpty()
        .isLength({ min: 8 });
      var errors = req.validationErrors();
      if (errors) {
        var messages = [];
        errors.forEach(function(error) {
          messages.push(error.msg);
        });
        return done(null, false, req.flash("error", messages));
      }
      User.findOne({ email: email }, function(err, user) {
        if (err) {
          return done(err);
        }
        if (user) {
          return done(null, false, { message: "Email is already in use." });
        }
        var newUser = new User();
        newUser.email = email;
        var check = sendEmail(email);
        newUser.password = newUser.encryptPassword(password);
        newUser.save(function(err, result) {
          if (err) {
            return done(err);
          }
          return done(null, newUser);
        });
      });
    }
  )
);

passport.use(
  "local.signin",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true
    },
    function(req, email, password, done) {
      req
        .checkBody("email", "Invalid Email")
        .notEmpty()
        .isEmail();
      req
        .checkBody("password", "Invalid Password")
        .notEmpty()
        .isLength({ min: 6 });

      console.log(password);
      var errors = req.validationErrors();
      if (errors) {
        var messages = [];
        errors.forEach(function(error) {
          messages.push(error.msg);
        });
        return done(null, false, req.flash("error", messages));
      }
      User.findOne({ email: email }, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "No user found!" });
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: "Wrong Password!" });
        }
        if (user.isAdmin == true) {
          req.session.admin = true;
        }
        req.session.useremail = email;
        return done(null, user);
      });
    }
  )
);

function sendEmail(email) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false,
    port: 25,
    auth: {
      user: "legavroche2@gmail.com",
      pass: "fazlurrehman"
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  let HelperOptions = {
    from: '"Le Gavroche" <legavroche2@gmail.com',
    to: email,
    subject: "Thank you for signing up!",
    text:
      "Hello " +
      email +
      "! Welcome to Le Gavroche! We are here to serve you the best food available!"
  };

  transporter.sendMail(HelperOptions, (error, info) => {
    if (error) {
      console.log(error);
    }
    console.log("The message has been sent!");
  });
  return true;
}
