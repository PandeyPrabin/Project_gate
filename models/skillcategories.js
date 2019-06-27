var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SkillCategorySchema = new Schema({
  name: String,
  color: String
});

SkillCategorySchema.pre('remove', function (next) {
  // Remove all the assignment docs that reference the removed person.
  console.log("asdfsadf")
});

//Export model
module.exports = mongoose.model('skillcategories', SkillCategorySchema);