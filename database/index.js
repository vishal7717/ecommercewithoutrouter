module.exports.init = function()
{
  const mongoose = require('mongoose');
  mongoose.connect("mongoose cluster link")
  .then(function()
  {
    console.log("db is live")
  })
  .catch(function()
  {
    console.log("error in db connection")
  })
}
