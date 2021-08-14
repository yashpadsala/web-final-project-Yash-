// require mongoose and setup the Schema
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// connect to Your MongoDB Atlas Database
//mongoose.connect("mongodb+srv://temp:<3n0YgcutBTiOY1BA>@cluster0.m0xlb.mongodb.net/WebHostingUserData?retryWrites=true&w=majority");
let db1 = mongoose.createConnection("mongodb+srv://temp:DCQergyYohRgBIVK@cluster0.m0xlb.mongodb.net/WebHostingUserData?retryWrites=true&w=majority",
 {useNewUrlParser: true, useUnifiedTopology: true});

const plan_info = new Schema({
  isPopular: {
      "type": String,
      "default": "false",
  },
  logo: {
      "type": String,
  },
  planname: {
      "type": String,
      "required": true,
  },
  plandesc: {
    "type": String,
    "required": true,
  },
  planprice: {
    "type": Number,
    "required": true,
  },
  planfetures: {
    "type": String,
    "required": true,
  },
});

var Plans = db1.model("planInfo", plan_info);


module.exports = Plans;