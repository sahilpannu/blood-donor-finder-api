const express = require("express");
const app = express();

app.use(express.json());

/* ================================
   HOME ROUTE
================================ */
app.get("/", (req, res) => {
  res.send("🩸 Blood Donor Finder API is running. Use /api/donors");
});

/* ================================
   IN-MEMORY DATABASE
================================ */
let donors = [
  {
    id: 1,
    name: "Sahil",
    bloodGroup: "O+",
    city: "Hisar",
    phone: "9999999999"
  }
];

/* ================================
   VALIDATION LOGIC
================================ */
const validBloodGroups = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
];

function validateDonor({ name, bloodGroup, city, phone }) {
  if (!name || name.trim() === "") {
    return "Name is required";
  }

  if (!city || city.trim() === "") {
    return "City is required";
  }

  if (!bloodGroup || !validBloodGroups.includes(bloodGroup)) {
    return "Invalid blood group";
  }

  if (!phone || !/^[0-9]{10}$/.test(phone)) {
    return "Phone number must be 10 digits";
  }

  return null;
}

/* ================================
   POST: REGISTER DONOR
================================ */
app.post("/api/donors", (req, res) => {
  const error = validateDonor(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error
    });
  }

  const newDonor = {
    id: donors.length + 1,
    name: req.body.name.trim(),
    bloodGroup: req.body.bloodGroup,
    city: req.body.city.trim(),
    phone: req.body.phone
  };

  donors.push(newDonor);

  res.status(201).json({
    success: true,
    donor: newDonor
  });
});

/* ================================
   GET: SEARCH DONORS
================================ */
app.get("/api/donors", (req, res) => {
  const { bloodGroup, city } = req.query;
  let result = donors;

  if (bloodGroup) {
    result = result.filter(
      d => d.bloodGroup.toLowerCase() === bloodGroup.toLowerCase()
    );
  }

  if (city) {
    result = result.filter(
      d => d.city.toLowerCase() === city.toLowerCase()
    );
  }

  res.json(result);
});

/* ================================
   DELETE: REMOVE DONOR
================================ */
app.delete("/api/donors/:id", (req, res) => {
  const id = parseInt(req.params.id);
  donors = donors.filter(d => d.id !== id);

  res.json({ message: "Donor removed successfully" });
});

/* ================================
   START SERVER
================================ */
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
