// require mongoose and setup the Schema
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// connect to Your MongoDB Atlas Database
//mongoose.connect("mongodb+srv://temp:<3n0YgcutBTiOY1BA>@cluster0.m0xlb.mongodb.net/WebHostingUserData?retryWrites=true&w=majority");
let db1 = mongoose.createConnection("mongodb+srv://temp:DCQergyYohRgBIVK@cluster0.m0xlb.mongodb.net/WebHostingUserData?retryWrites=true&w=majority",
 {useNewUrlParser: true, useUnifiedTopology: true});

const user_account = new Schema({
  isUser: {
      "type": Boolean,
      "default": true,
  },
  firstname: {
      "type": String,
      "required": true,
  },
  lastname: {
      "type": String,
      "required": true,
  },
    email: {
      "type": String,
      "required": true,
      "unique": true,
    },
    phonenumber: {
      "type": String,
      "required": true,
    },
    companyname: {
      "type": String,
      "default": "",
    },
    stAddress1: {
      "type": String,
      "required": true,
    },
    stAddress2: {
      "type": String,
      "default": "",
    },
    city: {
      "type": String,
      "required": true,
    },
    postalcode: {
      "type": String,
      "required": true,
    },
    province: {
      "type": String,
      "default": "",
    },
    country: {
      "type": String,
      "required": true,
    },
    taxid: {
      "type": String,
      "default": 0,
    },
    password: {
      "type": String,
      "required": true,
    },
    subPrice: {
      "type": Number,
      "default": 0.00,
    }
});

var Account = db1.model("userAccount", user_account);

//const Account = mongoose.model("")

module.exports = Account;