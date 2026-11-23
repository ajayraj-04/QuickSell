// routes/products.js - home, browse, details, add, edit, delete, mark as sold

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Product = require("../models/Product");

const router = express.Router();

// ---------- Image upload settings (multer) ----------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "public", "uploads")); // save photos here
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // example: 1700000000.jpg
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // maximum 2 MB
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);   // it is an image, accept
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// ---------- Check: only logged in sellers can go ahead ----------
function requireLogin(req, res, next) {
  if (!req.session.user) {
    req.session.message = "Please login first";
    return res.redirect("/login");
  }
  next();
}

// ---------- Small helper: if the database gives an error, show the error page (no crash) ----------
function safe(handler) {
  return function (req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

// ---------- Small helper: make search text safe ----------
function safeText(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------- Home page ----------
router.get("/", safe(async function (req, res) {
  const products = await Product.find({ status: "available" }).sort({ createdAt: -1 }).limit(3);
  res.render("home", { title: "Home", products: products });
}));

// ---------- Browse page (with search and filter) ----------
router.get("/browse", safe(async function (req, res) {
  const q = (req.query.q || "").trim();
  const category = req.query.category || "";
  const sub = req.query.sub || "";
  const location = (req.query.location || "").trim();

  // Build the filter step by step
  const filter = { status: "available" };
  if (q) filter.name = { $regex: safeText(q), $options: "i" };         // i = ignore capital letters
  if (category) filter.category = category;
  if (category && sub) filter.subcategory = sub;
  if (location) filter.location = { $regex: safeText(location), $options: "i" };

  const products = await Product.find(filter).sort({ createdAt: -1 });

  res.render("browse", {
    title: "Browse",
    products: products,
    q: q,
    category: category,
    sub: sub,
    location: location,
  });
}));

// ---------- Add product page ----------
router.get("/products/add", requireLogin, function (req, res) {
  res.render("add", { title: "Add Product" });
});

// ---------- Add product form submitted ----------
router.post("/products/add", requireLogin, upload.single("image"), safe(async function (req, res) {
  await Product.create({
    name: req.body.name,
    category: req.body.category,
    subcategory: req.body.subcategory || "",
    quantity: req.body.quantity,
    price: req.body.price,
    location: req.body.location,
    description: req.body.description,
    contactPhone: req.body.contactPhone,
    image: req.file ? req.file.filename : "", // no photo = empty
    seller: req.session.user.id,
  });

  req.session.message = "Product added successfully";
  res.redirect("/my-products");
}));

// ---------- My products page (only my own products) ----------
router.get("/my-products", requireLogin, safe(async function (req, res) {
  const products = await Product.find({ seller: req.session.user.id }).sort({ createdAt: -1 });
  res.render("my-products", { title: "My Products", products: products });
}));

// ---------- Product details page ----------
router.get("/products/:id", async function (req, res) {
  try {
    // populate = also bring the seller's name and email
    const product = await Product.findById(req.params.id).populate("seller", "name email");
    if (!product) {
      return res.redirect("/browse");
    }
    res.render("details", { title: product.name, product: product });
  } catch (err) {
    res.redirect("/browse");
  }
});

// ---------- Edit page ----------
router.get("/products/:id/edit", requireLogin, async function (req, res) {
  try {
    // seller: me  ->  I can open only my own product
    const product = await Product.findOne({ _id: req.params.id, seller: req.session.user.id });
    if (!product) {
      return res.redirect("/my-products");
    }
    res.render("edit", { title: "Edit Product", product: product });
  } catch (err) {
    res.redirect("/my-products");
  }
});

// ---------- Edit form submitted ----------
router.post("/products/:id/edit", requireLogin, upload.single("image"), async function (req, res) {
  try {
    const newData = {
      name: req.body.name,
      category: req.body.category,
      subcategory: req.body.subcategory || "",
      quantity: req.body.quantity,
      price: req.body.price,
      location: req.body.location,
      description: req.body.description,
      contactPhone: req.body.contactPhone,
    };

    // Only change the photo if a new photo was chosen
    if (req.file) {
      newData.image = req.file.filename;
    }

    await Product.findOneAndUpdate({ _id: req.params.id, seller: req.session.user.id }, newData);
    req.session.message = "Product updated";
  } catch (err) {
    req.session.message = "Could not update the product";
  }
  res.redirect("/my-products");
});

// ---------- Mark as sold / available again ----------
router.post("/products/:id/sold", requireLogin, async function (req, res) {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.session.user.id });
    if (product) {
      product.status = product.status === "sold" ? "available" : "sold";
      await product.save();
    }
  } catch (err) {
    console.log(err.message);
  }
  res.redirect("/my-products");
});

// ---------- Delete ----------
router.post("/products/:id/delete", requireLogin, async function (req, res) {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, seller: req.session.user.id });

    // Also remove the photo file from the uploads folder
    if (product && product.image) {
      fs.unlink(path.join(__dirname, "..", "public", "uploads", product.image), function () {});
    }
    req.session.message = "Product deleted";
  } catch (err) {
    req.session.message = "Could not delete the product";
  }
  res.redirect("/my-products");
});

module.exports = router;
