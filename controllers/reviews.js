const Review = require("../model/review.js");
const Listing = require("../model/listing.js");


module.exports.createReview = async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            throw new ExpressError(404, "Listing not found");
        }
        const newReview = new Review(req.body.review);
         newReview.author = req.user._id;
        listing.reviews.push(newReview);
        await newReview.save();
        await listing.save();
         req.flash("success", "new review created");
        res.redirect(`/listing/${listing._id}`);
    }

module.exports.destroyReview = async (req, res) => {
        const { id, reviewId } = req.params;
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
         req.flash("success", " review Deleted");
        res.redirect(`/listing/${id}`);
    }