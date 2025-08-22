if(process.env.NODE_ENV !== "production") {
require('dotenv').config()
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const possport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./model/user.js");
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbURL = process.env.ATLASDB_URL; 

async function main() {
    await mongoose.connect(dbURL);
}

main()
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB", err);
    });

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
const store = MongoStore.create({
    mongoUrl:dbURL,
    crypto:{
        secret:process.env.SECRET ,
    },
    touchAfter: 24 * 3600,
});
store.on("error", () => {
    console.log("error in mongo session store", err);
})
const sessionOption = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized :true,
   cookie: {
    expires : Date.now()+ 7*24*60*60*1000,
    maxAge : 7*24*60*60*1000,
    httpOnly : true,

   },
};
// app.get("/", (req, res) => {
//     res.send("hello i am root");
// });
app.use(session(sessionOption));
app.use(flash());

app.use(possport.initialize());
app.use(possport.session());
possport.use(new LocalStrategy(User.authenticate()));

possport.serializeUser(User.serializeUser());
possport.deserializeUser(User.deserializeUser());

app.use((req, res, next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.get("/demouser", async (req, res) =>{
    let fakeuser = new User({
        email:"shiv@gmail.com",
        username: "delta-student"
    });
     let registeredUser = await User.register(fakeuser, "helloworld");
     res.send(registeredUser);
})
app.get("/", (req, res) => {
    res.redirect("/listing");
});
app.use("/listing", listingsRouter);
app.use("/listing/:id/reviews", reviewsRouter);
app.use("/", userRouter)


// 404 error handler
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// General error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});
