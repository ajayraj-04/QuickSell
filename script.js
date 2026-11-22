// public/js/script.js - small JavaScript for form checks and image preview

// ---------- 1. Add / Edit product form: check the phone number ----------
var productForm = document.getElementById("productForm");

if (productForm) {
  productForm.addEventListener("submit", function (event) {
    var phone = document.getElementById("phone").value.trim();

    // Phone must be exactly 10 digits
    if (!/^[0-9]{10}$/.test(phone)) {
      alert("Phone number must be 10 digits");
      event.preventDefault();      // stop the form from being sent
    }
  });
}

// ---------- 2. Image preview: show the photo before saving ----------
var imageInput = document.getElementById("image");

if (imageInput) {
  imageInput.addEventListener("change", function () {
    var file = imageInput.files[0];
    var preview = document.getElementById("preview");

    if (file) {
      preview.src = URL.createObjectURL(file);   // temporary link to the chosen photo
      preview.style.display = "block";           // show the image
    }
  });
}

// ---------- 3. Register form: password and confirm password must match ----------
var registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", function (event) {
    var password = document.getElementById("password").value;
    var confirm = document.getElementById("confirm").value;
    var phone = registerForm.elements["phone"].value.trim();

    if (!/^[0-9]{10}$/.test(phone)) {
      alert("Phone number must be 10 digits");
      event.preventDefault();
      return;
    }
    if (password !== confirm) {
      alert("Passwords do not match");
      event.preventDefault();
    }
  });
}


// ---------- 4. Add/Edit product: fill the "Type" list when a category is chosen ----------
var categorySelect = document.getElementById("category");
var subSelect = document.getElementById("subcategory");

if (categorySelect && subSelect && typeof categoryData !== "undefined") {

  var fillTypes = function () {
    var types = categoryData[categorySelect.value].subs;       // example: ["Comic", "Horror", ...]
    var selected = subSelect.getAttribute("data-selected");    // the saved type (edit page)

    subSelect.innerHTML = "";                                  // clear the old list

    types.forEach(function (name) {
      var option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      if (name === selected) option.selected = true;
      subSelect.appendChild(option);
    });
  };

  categorySelect.addEventListener("change", function () {
    subSelect.setAttribute("data-selected", "");               // forget the old type
    fillTypes();
  });

  fillTypes();                                                 // run once when the page opens
}