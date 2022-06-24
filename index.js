//Importing 3rd part Module
const express = require('express')
const session = require('express-session')
const fs = require('fs');
// const multer = require('multer');

//Local Import
const db = require('./database');
const userModel = require("./database/models/userModel");
const cartModel = require("./database/models/cartModel");
const sendMail = require("./utils/sendMail");
const token = require("./utils/encryptDecrypt");
const { request } = require('http');
const encrypt = token.encrypt
const decrypt = token.decrypt
const sha256 = token.sha256


//Express Setup
const app = express();

let port = 3000
app.listen(port, () => {
    console.log(`Server is running on ${port}`)
})

//Middleware

app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: "VP ecommerce",
    resave: false,
    saveUninitialized: true,
}))
app.use(express.json());
app.use("/uploads", express.static(__dirname + "/uploads"))
app.use("/static", express.static(__dirname + "/static"))
app.use("/products/image", express.static(__dirname + "/products/image"))


//Multer Setup 
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/')
//     },
//     filename: function (req, file, cb) {
//         let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
//         cb(null, Date.now() + ext)
//     }
// })

// var upload = multer({ storage: storage })

//DB  initialization
db.init();

//EJS Setup
app.set('view engine', 'ejs');







//Global Variable;
let loop = 3;


// console.log(sha256("kritebh"))


/************************* Endpoint Started ******************************/


//Homepage
app.get("/", (req, res) => {
    if (req.session.isLoggedin) {
        fs.readFile("./products/product.json", (err, data) => {
            let product = JSON.parse(data);
            product = product.slice(0, 0);
            // console.log(product)
            res.render("home.ejs", { name: req.session.user.name })
        })

    }
    else {
        fs.readFile("./products/product.json", (err, data) => {
            let product = JSON.parse(data);
            product = product.slice(0, 0);
            // console.log(product);
            res.render("home.ejs", { name: "" })
        })
    }
})



/*********** Authentication And Authorization ***********/


//Login Endpoint
app.get('/login', (req, res) => {
    if (req.session.isLoggedin) {
        res.redirect("/");
    }
    else {
        res.render("auth/login.ejs", { message: "" });
    }
})

// Signup Endpoint
app.route("/signup")
    .get((req, res) => {
        if (req.session.isLoggedin) {
            res.redirect("/");
        }
        else {
            res.render("auth/signup.ejs", { message: "" });
        }
    })
    .post((req, res) => {
        const username = req.body.username
        const password = req.body.password
        const name = req.body.name

        userModel.find({ username: username }).then(function (users) {
            if (users.length === 0) {
                userModel.create({ username: username, name: name, password: sha256(password), isVerified: false }, (err) => {
                    let encryptedEmail = encrypt(username);
                    let html = `<p>Click the Link to verify Your Account</p>` + `<a href="http://localhost:3000/verify/${encryptedEmail}"> Click Here</a>`

                    sendMail(username, "Welcome To VP Store", html, (err) => {   //sending email for verification upon signup
                        if (err) {
                            res.render("auth/signup.ejs", { message: "Unable to send Email 😫😫" });
                        }
                        else {
                            res.render("auth/login.ejs", { message: "Verification Email has been sent successfully Please check your Email 👍" });
                        }
                    })
                })
            }
            else {
                res.render("auth/signup.ejs", { message: "Email already exist 😐😐" });
            }
        })
    })

// Verify Endpoint Upon Signup 
app.get("/verify/:id", (req, res) => {
    let decryptedEmail = decrypt(req.params.id)
    // console.log(decryptedEmail)
    userModel.find({ username: decryptedEmail }).then(user => {
        // console.log(user)
        if (user.length === 0) {
            res.render("auth/verify.ejs", { message: "Email signature mismatched 🤐🤐" })
        }
        else {
            userModel.updateOne({ username: decryptedEmail }, { isVerified: true }, (err, data) => {
                if (err) {
                    res.render("auth/verify.ejs", { message: "Email signature mismatched 🤐🤐, Please Contact Us" })
                }
                else {
                    res.render("auth/verify.ejs", { message: "You have successfully verified your Email 🤗🤗" })
                }
            });
        }
    })

})

//Login Endpoint
app.post('/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password

    userModel.findOne({ username: username, password: sha256(password) }).then((user) => {
        if (user === null) {
            res.render("auth/login.ejs", { message: "Username/Password is not correct 😶😶" })
        }
        else if (!user.isVerified) {
            res.render("auth/login.ejs", { message: "Please Verify Your Email Before Login 🙂🙂" })
        }
        else {
            req.session.isLoggedin = true;
            req.session.user = user;
            // req.session.loop = 3;
            res.redirect("/");
        }
    })
})

//Change Password Endpoint
app.get("/changepassword", (req, res) => {
    if (req.session.isLoggedin) {
        res.render("auth/changePassword.ejs", { message: "" })
    }
    else {
        res.redirect("/");
    }
})

app.post("/changepassword", (req, res) => {

    if (req.session.isLoggedin) {
        let user = req.session.user;
        let newPassword1 = req.body.password1
        let newPassword2 = req.body.password2

        if (newPassword1 !== newPassword2) {
            res.render("auth/changePassword.ejs", { message: "Both Password doesn't match 🙃🙃" })
        }
        else {
            userModel.updateOne({ username: user.username }, { password: sha256(newPassword1) }, (err, data) => {
                if (err) {
                    console.log(err)
                }
                else {
                    res.render("auth/changePassword.ejs", { message: "Password Updated Successfully 🎊🎉" })
                }
            })
        }
    }
    else {
        res.redirect("/")
    }
})


//Forgot Password Form Render Endpoint 
app.get("/forgot", (req, res) => {
    if (req.session.isLoggedin) {
        res.redirect("/changepassword");
    }
    else {
        res.render("auth/forgotPasswordSendMail.ejs", { message: "" })
    }
})

// Endpoint to handle sending Email for reset password
app.post("/forgot", (req, res) => {
    let email = req.body.username
    userModel.findOne({ username: email }).then(user => {
        if (user === null) {
            res.render("auth/forgotPasswordSendMail.ejs", { message: "Email is not registered ☹☹" })
        }
        else {
            let encryptedEmail = encrypt(email);
            let html = `<p>Click Below to reset your password</p>` + `<a href="http://localhost:3000/forgotpassword/${encryptedEmail}"> Reset Password</a>`
            sendMail(email, "Reset Password - MyShop", html, (err) => {
                if (err) {
                    console.log(err)
                }
                else {
                    res.render("auth/forgotPasswordSendMail.ejs", { message: "Email Sent Successfully 👍👍" })
                }
            })
        }
    })
})


//Endpoint to handle reset password link in Email
app.get("/forgotpassword/:id", (req, res) => {
    let decryptedEmail = decrypt(req.params.id);
    userModel.findOne({ username: decryptedEmail }).then(user => {
        res.render("auth/resetPassword.ejs", { message: "", username: user.username });
    })
})

//Endpoint to handle reset password Form
app.post("/resetpassword", (req, res) => {
    let username = req.body.username
    let password1 = req.body.password1
    let password2 = req.body.password2

    if (password1 !== password2) {
        res.render("error.ejs", { message: "Both Password Should Match, Try Again 😣😣" })
    }
    else {
        userModel.updateOne({ username: username }, { password: sha256(password1) }, (err) => {
            if (err) {
                console.log(err);
                res.render("error.ejs", { message: "Some Error Occurred Contact Us" })
            }
            else {
                res.render("auth/login.ejs", { message: "Password Reset Successfully Done 😊" })
            }
        })
    }
})


//Check If User is login
app.get("/checklogin", (req, res) => {
    if (req.session.isLoggedin) {
        res.sendStatus(200);
    }
    else {
        res.sendStatus(403);
    }
})




//Logout Endpoint
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
})



/******************* Products Logic Started *********************/


// Endpoint to handle Load More Button
app.get("/loadmore/:item", (req, res) => {

    let item = Number(req.params.item);
    fs.readFile("./products/product.json", (err, data) => {
        let product = JSON.parse(data);
        product = product.slice(item, item + 3);
        // console.log(product);
        res.status(200).json({ product: product })
    })
})


//All Cart Endpoint

app.get("/addtocart/:id", (req, res) => {

    if (req.session.isLoggedin) {
        let productId = req.params.id
        cartModel.findOne({ user: req.session.user.username, id: productId }).then(data => {
            if (data) {
                res.sendStatus(409);
            }
            else {
                fs.readFile("./products/product.json", (err, data) => {
                    let product = JSON.parse(data);
                    let ourProduct = product.filter(p => {
                        if (p.id === productId) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    })
                    ourProduct = ourProduct[0];
                    cartModel.create(
                        {
                            username: req.session.user.username,
                            id: productId,
                            productName: ourProduct.name,
                            image: ourProduct.image,
                            description: ourProduct.description,
                            price: ourProduct.price,
                            quantity: 1
                        },
                        (err) => {
                            if (err) {
                                console.log(err);
                            }
                        }
                    )

                    console.log(ourProduct)
                })

                res.sendStatus(200);
            }
        })

    }
    else {
        res.sendStatus(403)
    }
})

app.get("/mycart", (req, res) => {
    if (req.session.isLoggedin) {
        res.render("cart.ejs", { name: req.session.user.name });
    }
    else {
        res.redirect("/login")
    }
})

app.get("/productinmycart", (req, res) => {
    if (req.session.isLoggedin) {
        cartModel.find({ username: req.session.user.username }).then(data => {
            res.json({ product: data })
        })
    }
    else {
        res.json({ product: [] })
    }
})


app.post("/updatequantity", (req, res) => {
    console.log(req.body)
    if (req.session.isLoggedin) {

        if (Number(req.body.quantity) < 1) {
            res.sendStatus(400);
        }
        else {

            cartModel.find({ id: req.body.id }).then((d) => {
                let totalProductAlreadyInCart = 0;
                // console.log(d);
                for (let index = 0; index < d.length; index++) {
                    totalProductAlreadyInCart += d[index].quantity;
                }
                fs.readFile("./products/product.json", (err, data) => {
                    let product = JSON.parse(data);
                    let ourProduct = product.filter(p => {
                        if (p.id === req.body.id) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    })
                    ourProduct = ourProduct[0];
                    console.log(ourProduct)
                    console.log(totalProductAlreadyInCart)
                    // totalProductAlreadyInCart = totalProductAlreadyInCart -( Number(req.body.quantity) - 1)
                    console.log(totalProductAlreadyInCart)
                    if (totalProductAlreadyInCart > ourProduct.stock && Number(req.body.quantity)>totalProductAlreadyInCart) {
                        res.sendStatus(409)
                        console.log("after 409")
                    }
                    else {
                        cartModel.updateOne({ username: req.session.user.username, id: req.body.id }, { quantity: Number(req.body.quantity) }).then(err => {
                            if (err) {
                                // console.log(err)
                            }
                            else {
                                res.sendStatus(200);
                            }
                        })
                    }
                })
            })
        }
    }
    else {

        res.sendStatus(400);
    }
})

app.get("/deletefromcart/:id", (req, res) => {
    if(req.session.isLoggedin){
        cartModel.deleteOne({id:req.params.id},(err)=>{
            if(err){
                console.log(err);
            }
            else{
                res.sendStatus(200);
            }
        })
    }
    else{
        res.sendStatus(403);
    }
})