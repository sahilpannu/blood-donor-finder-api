const express = require("express"); // 1️⃣ express import

const app = express();              // 2️⃣ app initialize

app.use(express.json());            // 3️⃣ middleware

// 4️⃣ Home route (optional but safe)
app.get("/", (req, res) => {
  res.send("🩸 Blood Donor Finder API is running. Use /api/donors");
});

// 5️⃣ In-memory donor database
let donors = [
  {
    id: 1,
    name: "Sahil",
    bloodGroup: "O+",
    city: "Hisar",
    phone: "9999999999"
  }
];

// 6️⃣ Register donor
app.post("/api/donors", (req, res) => {
  const newDonor = {
    id: donors.length + 1,
    name: req.body.name,
    bloodGroup: req.body.bloodGroup,
    city: req.body.city,
    phone: req.body.phone
  };

  donors.push(newDonor);
  res.status(201).json(newDonor);
});

// 7️⃣ Search donors
app.get("/api/donors", (req, res) => {
  const { bloodGroup, city } = req.query;

  let result = donors;

  if (bloodGroup) {
    result = result.filter(d =>
      d.bloodGroup.toLowerCase() === bloodGroup.toLowerCase()
    );
  }

  if (city) {
    result = result.filter(d =>
      d.city.toLowerCase() === city.toLowerCase()
    );
  }

  res.json(result);
});

// 8️⃣ Delete donor
app.delete("/api/donors/:id", (req, res) => {
  const id = parseInt(req.params.id);
  donors = donors.filter(d => d.id !== id);
  res.json({ message: "Donor removed" });
});

// 9️⃣ Start server (ALWAYS LAST)
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
