const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../model/listing.js");

const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    try {
        await mongoose.connect(mongo_url);
        console.log("Connected to MongoDB");
        await initDB();
    } catch (err) {
        console.log("Error connecting to MongoDB", err);
    }
}

const initDB = async () => {
    try {
        await Listing.deleteMany({});
        initData.data = initData.data.map((obj) =>({...obj, owner: "6862529614b0cbb344718bda"}));
        await Listing.insertMany(initData.data);
        console.log("Data was initialized");
    } catch (err) {
        console.log("Error initializing data", err);
    }
};

main();