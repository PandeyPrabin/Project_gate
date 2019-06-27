var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ProjectSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  manager: {
    type: Schema.ObjectId,
    ref: 'users'
  },
  status: String,
  startdate: Date,
  deadline: Date,
  enddate: Date,
  description: String,
  imagepath: String,
  openpositions: [{
    position: {
      type: Schema.ObjectId,
      ref: 'skillcategories'
    }
  }],
  suggestions: [{
    user: {
      type: Schema.ObjectId,
      ref: 'users'
    },
    positions: [{
      type: Schema.ObjectId,
      ref: 'skillcategories'
    }],
    status: String
  }],
  participants: [{
    participant: {
      type: Schema.ObjectId,
      ref: 'users'
    },
    started: {
      type: Date,
      default: Date.now
    },
    positions: [{
      position: {
        type: Schema.ObjectId,
        ref: 'skillcategories'
      }
    }],
    edit: {
      type: Boolean,
      default: false
    }
  }],
  applications: [{
    position: String,
    applicant: {
      type: Schema.ObjectId,
      ref: 'users'
    },
    applied: {
      type: Date,
      default: Date.now
    },
    positions: [{
      type: Schema.ObjectId,
      ref: 'skillcategories'
    }],
    skills: [{
      category: {
        type: Schema.ObjectId,
        ref: 'skillcategories'
      },
      name: String
    }],
    status: String,
    applicationtext: String
  }],
  skills: [{
    name: String,
    category: {
      type: Schema.ObjectId,
      ref: 'skillcategories'
    },
    rating: Number
  }]
});

//Export model
module.exports = mongoose.model('projects', ProjectSchema);