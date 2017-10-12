var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var User = require('./db').User;



//认证通过后存取数据到cookie
passport.serializeUser(function (user, cb) {
  cb(null, user._id);
});

//认证不通过删除数据
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});


passport.use("login", new Strategy(function (username, password, done) {
  User.findOne({ username: username }, function (err, user) {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { message: "No user has that username!" });
    }
    user.checkPassword(password, function (err, isMatch) {
      if (err) { return done(err); }
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Invalid password." });
      }
    });
  });
}));

