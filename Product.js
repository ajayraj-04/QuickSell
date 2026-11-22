// models/Product.js - how a product is saved in the database

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, default: "" },   // example: Comic, Car, TV
    quantity: { type: String, required: true },   // example: "50 kg"
    price: { type: Number, required: true },
    location: { type: String, required: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },         // only the file name, example: 1700000000.jpg
    contactPhone: { type: String, required: true },
    status: { type: String, default: "available" }, // "available" or "sold"
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who added it
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
