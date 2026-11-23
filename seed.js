// seed.js - adds a demo seller and sample products (run: npm run seed)

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Product = require("./models/Product");

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/quicksell";

async function addSampleData() {
  await mongoose.connect(MONGO_URL);

  // Demo seller (login: demo@quicksell.com / 123456)
  let seller = await User.findOne({ email: "demo@quicksell.com" });
  if (!seller) {
    seller = await User.create({
      name: "Demo Seller",
      email: "demo@quicksell.com",
      phone: "9876543210",
      password: await bcrypt.hash("123456", 10),
    });
  }

  // Remove old sample products of this demo seller, then add fresh ones
  await Product.deleteMany({ seller: seller._id });

  // name, category, type, quantity, price, location, description
  const items = [
    ["Old Newspapers", "Paper", "Newspapers", "50 kg", 300, "Chennai", "Clean and dry newspapers collected over one year."],
    ["Cardboard Boxes", "Paper", "Cardboard", "80 pieces", 400, "Chennai", "Strong boxes in good condition."],
    ["Plastic Bottles", "Plastic", "Bottles", "200 pieces", 500, "Madurai", "Empty water bottles, washed and ready for recycling."],
    ["Iron Scrap", "Metal", "Iron", "100 kg", 2500, "Coimbatore", "Mixed iron scrap from an old workshop."],
    ["Old Laptop", "Electronic", "Laptop", "1 piece", 4000, "Trichy", "Not working. Good for spare parts or recycling."],
    ["Wooden Table", "Furniture", "Table", "2 pieces", 1500, "Salem", "Old wooden tables, need small repair."],
    ["Horror Story Books", "Books", "Horror", "10 books", 600, "Chennai", "Collection of horror novels in good condition."],
    ["Comic Books Set", "Books", "Comic", "25 books", 800, "Madurai", "Old comic books, all pages intact."],
    ["Love Story Novels", "Books", "Love Story", "8 books", 450, "Trichy", "Popular love story novels."],
    ["Old Scooty", "Vehicles", "Scooty", "1 piece", 15000, "Coimbatore", "Running condition, needs small service."],
    ["Used Cycle", "Vehicles", "Cycle", "1 piece", 2500, "Salem", "Kids cycle, good condition."],
    ["Old Car", "Vehicles", "Car", "1 piece", 90000, "Chennai", "Hatchback, 10 years old, working."],
    ["LED TV 32 inch", "Home Appliances", "TV", "1 piece", 5000, "Madurai", "Working TV, remote not available."],
    ["Single Door Fridge", "Home Appliances", "Fridge", "1 piece", 4500, "Trichy", "Cooling works well."],
    ["Washing Machine", "Home Appliances", "Washing Machine", "1 piece", 6000, "Chennai", "Semi automatic, 7 kg."],
  ];

  for (const item of items) {
    await Product.create({
      name: item[0],
      category: item[1],
      subcategory: item[2],
      quantity: item[3],
      price: item[4],
      location: item[5],
      description: item[6],
      contactPhone: "9876543210",
      seller: seller._id,
    });
  }

  console.log("Sample data added. Login: demo@quicksell.com / 123456");
  await mongoose.disconnect();
}

addSampleData().catch(function (err) {
  console.log("Seed failed: " + err.message);
  process.exit(1);
});
