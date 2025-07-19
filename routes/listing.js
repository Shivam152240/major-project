const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../model/listing.js");
const { isLoggedIn, isOwner,validateListing } = require("../middleware.js");
const listingControllers = require("../controllers/listing.js");
const { render } = require("ejs");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage })

router.route("/")
.get( wrapAsync(listingControllers.index))
.post(  isLoggedIn,upload.single('listing[image]'), validateListing, wrapAsync(listingControllers.createListing));



// New listing form
router.get("/new",isLoggedIn,listingControllers.renderNewForm);

router.route("/:id")
.put(isLoggedIn,isOwner,upload.single('listing[image]'), validateListing, wrapAsync(listingControllers.updateListing))
.get( wrapAsync(listingControllers.showListing))
.delete(isLoggedIn,isOwner, wrapAsync(listingControllers.destroyListing))

// Edit form route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingControllers.renderEditForm));


module.exports = router;