var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  birthdate: Date,
  gender: String,
  email: String,
  password: String,
  phonenum: String,
  address: String,
  city: String,
  postalcode: String,
  privilege: {
    type: String,
    default: 'student'
  },
  degree: String,
  studygroup: String,
  bio: String,
  imagepath: String,
  cvpath: String,
  wishes: [{
    category: {
      type: Schema.ObjectId,
      ref: 'skillcategories'
    }
  }],
  skills: [{
    name: String,
    category: {
      type: Schema.ObjectId,
      ref: 'skillcategories'
    },
    rating: Number
  }],
  skilldev: [{
    name: String,
    category: {
      type: Schema.ObjectId,
      ref: 'skillcategories'
    }
  }],
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

// Virtual for author's full name
UserSchema
  .virtual('name')
  .get(function () {
    return this.firstname + ' ' + this.lastname;
  });

//Export model
module.exports = mongoose.model('users', UserSchema);