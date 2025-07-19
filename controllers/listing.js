const Listing = require("../model/listing");
module.exports.index = async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listing/index.ejs", { allListing });
}
module.exports.renderNewForm =  (req, res) => {
    res.render("listing/new.ejs");
}
module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author"},}).populate("owner");
    if(!listing) {
         req.flash("error", " Listing you requested for does not exist!");
          res.redirect("/listing");
    }
    res.render("listing/show.ejs", { listing });
}
module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; 
    newListing.image = { url, filename };
    await newListing.save();
    req.flash("success", "new listing created");
    res.redirect("/listing");
}
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
  if(!listing) {
         req.flash("error", " Listing you requested for does not exist!");
          res.redirect("/listing");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250") 
    res.render("listing/edit.ejs", { listing, originalImageUrl });
}
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    let listing =  await Listing.findById(id);
    await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }
     req.flash("success", " listing Updated");
    res.redirect(`/listing/${id}`);
}
module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
     req.flash("success", " listing Deleted");
    res.redirect("/listing");
}