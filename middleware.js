const Listing = require("./model/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./model/review.js");
module.exports.isLoggedIn = (req, res, next) => {
     if(!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to create a listing");
        return res.redirect("/login");
    }
    next();
};
module.exports.saveRedirectUrl = (req, res, next) =>{
    if(req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}
module.exports.isOwner = async(req, res, next) =>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
      if(!listing.owner.equals(res.locals.currUser._id)){
            req.flash("error", "you are not owner this listing");
           return res.redirect(`/listing/${id}`);
        }
        next();

};
module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errmsg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400, errmsg);
    } else {
        next();
    }
};
module.exports.validateReview = async (req, res, next) => {
    try {
        await reviewSchema.validateAsync(req.body);
        next();
    } catch (error) {
        const errmsg = error.details
            ? error.details.map(el => el.message).join(",")
            : error.message;
        next(new ExpressError(400, errmsg));
    }
};
module.exports.isReviewAuthor = async(req, res, next) =>{
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
      if(!review.author.equals(res.locals.currUser._id)){
            req.flash("error", "you are not author of this review");
           return res.redirect(`/listing/${id}`);
        }
        next();

};