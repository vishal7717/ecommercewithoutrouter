module.exports.init = function()
{
  const mongoose = require('mongoose');
  mongoose.connect("mongodb+srv://vishal:12345@cluster0.y2v89.mongodb.net/ecommerce?retryWrites=true&w=majority")
  .then(function()
  {
    console.log("db is live")
  })
  .catch(function()
  {
    console.log("error in db connection")
  })
}