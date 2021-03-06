var mongoose = require('mongoose');
var bcrypt = require("bcrypt-nodejs");
// 定义加密计算强度（值为1-3时会默认10的计算强度）
var SALT_FACTOR = 10;
var userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  avatar: {
        required: true,
      type: String,
      default: 'https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/male/101.png'
  }
});
var noop = function () { };
userSchema.pre("save", function (done) {
  var user = this;

  if (!user.isModified("password")) {
    return done();
  }

  bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
    if (err) { return done(err); }
    bcrypt.hash(user.password, salt, noop, function (err, hashedPassword) {
      if (err) { return done(err); }
      user.password = hashedPassword;
      done();
    });
  });
});

userSchema.methods.checkPassword = function (guess, done) {
  bcrypt.compare(guess, this.password, function (err, isMatch) {
    done(err, isMatch);
  });
};



var User = mongoose.model("User", userSchema);

module.exports = User;
