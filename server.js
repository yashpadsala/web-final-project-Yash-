
const exp = require("express");
const app = exp();
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const bcryptjs = require("bcryptjs");
const { check, validationResult } = require("express-validator");

const clientSessions = require("client-sessions");

// Multer
var multer  = require('multer')

// const imageStorage = multer.diskStorage({  
//   destination: "./planImg", 
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '_' + Date.now() 
//            + path.extname(file.originalname))
      
//   }
// });

// const imageUpload = multer({
//   storage: imageStorage,
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(png|jpg|gif)$/)) { 
//        return cb(new Error('Please upload a Image'))
//      }
//    cb(undefined, true)
// }
// }) 

const path = require("path");

app.use(bodyParser.urlencoded({ extended: false }));

// Database
var userAccount = require("./static/models/userdata");

var adminPlans = require("./static/models/plandata");
const { Script } = require("vm");

// Setup client-sessions
app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: "CanadaWebHosting_website", // this should be a long un-guessable string.
  duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/sign_in");
  }
  else {
    next();
  }
}

// check user type 
function adminType(req, res, next) {
  if (req.session.user.usertype === "admin") {
    next();   
  }
  else {
    res.redirect("/sign_in");
  }
}

function userType(req, res, next) {
  if (req.session.user.usertype === "user") {
    next();   
  }
  else {
    res.redirect("/sign_in");
  }
}

// Parse application/x-www-form-urlencoded
//app.use(exp.urlencoded({ extended: false }));


// Setup the static folder that static resources can load from
// like images, css files, etc.
app.use(exp.static("static"));
app.use(exp.static(path.join("static")));
app.set("views", path.join(__dirname, "/static/views"));

// Templating Engine
app.set("view engine", ".hbs");
app.engine(
  ".hbs",
  handlebars({
    extname: ".hbs",
    defaultLayout: "main",
  })
);



app.get("/", function (req, res) {
  res.render("home", {
    title: "home",
  });
});

app.get("/plans", function (req, res) {
  adminPlans.find({}, function (err, allPlans){
    res.render("plans", {
      title: "plans",
      layout: "hotDeals",
      everyPlan: allPlans,
    });
  }).lean();
});

app.get("/sign_in", function (req, res) {
  res.render("sign_in", {
    title: "login",
    layout: "register",
  });
});

app.get("/create_account", function (req, res) {
  res.render("create_account", {
    title: "Register",
    layout: "register",
  });
});

app.get("/dashboard",ensureLogin,userType, function (req, res) {
  adminPlans.find({}, function (err, allPlans){
    res.render("dashboard", {
      title: "Dashboard",
      layout: "success",
      email : req.session.user.useremail,
      Fname : req.session.user.userfname,
      Lname : req.session.user.userlname,
      everyPlan: allPlans,
    });
  }).lean();
});

// imageUpload.single('image'),
app.get("/AdminDashboard", ensureLogin, adminType, function (req, res) {
  let email, Fname, Lname;
  adminPlans.find({}, function (err, allPlans){
    res.render("AdminDashboard", {
      title: "Admin dashboard",
      layout: "success",
      email : req.session.user.useremail,
      Fname : req.session.user.userfname,
      Lname : req.session.user.userlname,
      everyPlan: allPlans,
    });
  }).lean();
});

app.get("/logout", function(req, res) {
  req.session.reset();
  res.redirect("/");
});

app.get("/editPlans", ensureLogin, adminType, function(req, res) {
  res.render("editPlans", {
    title: "Edit Plans",
    layout: "addNewPlan",
  });
});

app.get("/updatePlans/:id", (req, res) => {
  adminPlans.findById(req.params.id, (err, doc) => {
    if (!err) {
      res.render("updatePlans", {
        title: "Update Plans",
        layout: "addNewPlan",
        thisPlan: doc,
      });
    }
  }).lean();
})

app.get("/delete/:id", (req, res) => {
  adminPlans.findByIdAndRemove(req.params.id, (err, doc) => {
    if (err) {
      console.log("Error while delete this plan" + err);
    } else {
      res.redirect(`/AdminDashboard`);
    }
  });
})

app.get("/orderCart/:id", function (req, res) {
  adminPlans.findById(req.params.id, (err, doc) => {
    if (!err)
    {
      res.render("orderCart", {
        title: "Order cart",
        layout: "cart",
        thisPlan: doc,
      });
    }
  }).lean();
});

app.get("/checkout", ensureLogin, (req, res) => {
  res.redirect(`/dashboard`); 
    
});

// The editPlan page
app.post("/editplans", (req, res) => {
  var planDetails = {
    img: req.body.planimg,
    pname: req.body.planname,
    pdesc: req.body.desc,
    pprice: req.body.price,
    pfetures: req.body.fetures,
  };

  if(planDetails.pname === "" || planDetails.pdesc === "" || planDetails.pprice === "" || planDetails.pfetures === "") {
    // Render 'missing credentials'
    return res.render("editPlans", {
      errorMsg: "Missing credentials.", 
      planDetails: planDetails,
      layout: "addNewPlan",
    });
  }
  else {
    const newplan = new adminPlans({
      logo: planDetails.img,
      planname: planDetails.pname,
      plandesc: planDetails.pdesc,
      planprice: planDetails.pprice,
      planfetures: planDetails.pfetures,
    })
    .save();
    res.redirect(`/AdminDashboard`); 
  }
});

//post method of updatePlans

app.post("/updatePlans", ensureLogin, (req, res) => {
  if (req.body._id == "") {
    console.log("ID is not found");
  } else {
    updateRecord(req, res);
  }
});

function updateRecord(req, res) {
  adminPlans.findOneAndUpdate(
    
    { _id: req.body.ID },
    req.body,
    { new: true },
    (err, doc) => {
      if (!err) {
        
        res.redirect("AdminDashboard");
      } else {
        if (err.name == "ValidationError") {
          handleValidationError(err, req.body);
          res.render("updatePlans", {
            viewTitle: "Update Plan",
            layout: "addNewPlan",
            thisPlan: req.body,
          });
        } else {
          console.log("Error occured in Updating the records" + err);
        }
      }
    }
  );
}

// The login route that adds the user to the session
app.post("/sign_in", (req, res) => {
  var userLoginData = {
    username: req.body.Iusername,
    password: req.body.Ipassword,
  };

  if(userLoginData.username === "" || userLoginData.password === "") {
    // Render 'missing credentials'
    return res.render("sign_in", {
      errorMsg: "Missing credentials.", 
      userLoginData: userLoginData,
      layout: "register",
    });
  }
  else
  {
    userAccount.findOne({ email: userLoginData.username }).then((userData) => {
      if(userData)
      {
        if(userData.isUser === false) // for admin login
        {         
          req.session.user = {
            useremail: userLoginData.username,
            userfname: userData.firstname,
            userlname: userData.lastname,
            userid: userData._id,
            usertype: "admin"
          };
          res.redirect(`/AdminDashboard`);          
        }
        else
        {
          bcryptjs
        .compare(userLoginData.password, userData.password)
        .then((isMatched) => {
          if (isMatched == true) {
            req.session.user = {
              useremail: userLoginData.username,
              userfname: userData.firstname,
              userlname: userData.lastname,
              userid: userData._id,
              usertype: "user"
            };
            res.redirect(`/dashboard`);
           
          }
          else
          {
            return res.render("sign_in", {
              errorMsg: "Sorry, you entered the wrong email and/or password.", 
              userLoginData: userLoginData,
              layout: "register",
            });
          }
        })
        }
      }
      else 
      {
        return res.render("sign_in", {
          errorMsg: "Sorry, you entered the wrong email and/or password.", 
          userLoginData: userLoginData,
          layout: "register",
        });
      }
    })
  }
});

  
app.post(
  "/create_account",
  check("firstname", "FirstName must be enterd").notEmpty(),
  check("lastname", "LastName must be enterd").notEmpty(),
  check("email", "Email must be enterd").notEmpty(),
  check("phonenumber", "PhoneNumber must be enterd").isNumeric({
    check: true,
  }),
  check("stadd1", "Address must be enterd").notEmpty(),
  check("city", "City must be enterd").notEmpty(),
  check("postalcode", "Postalcode must be enterd").notEmpty(),
  check("country", "Country must be enterd").notEmpty(),
  check("password", "Please enter 6 to 12 char passoword includes alphabates")
    .matches("^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9]+$")
    .isLength({ min: 6, max: 12 }),
  check("confpassword", "ConfirmPassword is mandatory").notEmpty(),

  function (req, res) {
    let userRegister = {
      returnfname: req.body.firstname,
      returnlname: req.body.lastname,
      returnemail: req.body.email,
      returnphone: req.body.phonenumber,
      returnbilladd: req.body.billingaddress,
      returnstadd1: req.body.stadd1,
      returnstadd2: req.body.stadd2,
      returncity: req.body.city,
      returnpostalcode: req.body.postalcode,
      returnprovince: req.body.province,
      returncountry: req.body.country,
      returntax: req.body.taxid,
      returnpass: req.body.password,
      returnconfpass: req.body.confpassword,
    };

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMsg = errors.array();

      let fieldValidity = [
        { name: "firstname", valid: "" },
        { name: "lastname", valid: "" },
        { name: "email", valid: "" },
        { name: "phonenumber", valid: "" },
        { name: "stadd1", valid: "" },
        { name: "city", valid: "" },
        { name: "postalcode", valid: "" },
        { name: "country", valid: "" },
        { name: "password", valid: "" },
        { name: "confpassword", valid: "" },
      ];

      for (let i = 0; i < fieldValidity.length; i++) {
        if (errorMsg.some((el) => el.param === fieldValidity[i].name)) {
          fieldValidity[i].valid = "is-invalid";
        } else {
          fieldValidity[i].valid = "is-valid";
        }
      }


      let errorReplay = [];
      for (let i = 0; i < errorMsg.length; i++) {
        errorReplay[errorMsg[i].param] = errorMsg[i].msg;
      }

      res.render("create_account", {
        layout: "register",
        userRegister,
        errorReplay,
        fieldValidity,
      });
    } else {
      let registerErrorMsg = [];

      userAccount.findOne({ email: userRegister.returnemail }).then((user) => {
      if (user) {
        registerErrorMsg = true;
        

        res.render("create_account", {
          registerErrorMsg,
          layout: "register",
          userRegister,
        });
        } else {
          const newUser = new userAccount({
            firstname: userRegister.returnfname,
            lastname: userRegister.returnlname,
            email: userRegister.returnemail,
            phonenumber: userRegister.returnphone,
            companyname: userRegister.returnbilladd,
            stAddress1: userRegister.returnstadd1,
            stAddress2: userRegister.returnstadd2,
            city: userRegister.returncity,
            postalcode: userRegister.returnpostalcode,
            province: userRegister.returnprovince,
            country: userRegister.returncountry,
            password: userRegister.returnpass,
            
          });

          bcryptjs.genSalt(12, (err, salt) => {
            bcryptjs.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then((user) => {
                  // req.session.user = {
                  //   useremail: userRegister.returnemail,
                  //   userfname: userRegister.returnfname,
                  //   userlname: userRegister.returnlname,
                  //   userid: userData._id,
                  //   usertype: "user"
                  // };
                  res.redirect(`/sign_in`);
                })
                .catch((err) => console.log(err));
            });
          });
        }
      });
      }
    }
  );


// setup http server to listen on HTTP_PORT
var HTTP_PORT = process.env.PORT || 8080;
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
  }

app.listen(HTTP_PORT, onHttpStart);