const express = require("express");
const app = express();

app.use(express.json());

/* ================================
   HOME UI (PUBLIC LANDING PAGE)
================================ */
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Blood Donor Finder</title>

  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: #ffffff;
      color: #000;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .container {
      text-align: center;
      max-width: 700px;
      padding: 20px;
    }

    .title {
      font-size: 42px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .title span {
      font-size: 42px;
    }

    .subtitle {
      margin-top: 20px;
      font-size: 18px;
      line-height: 1.6;
      color: #333;
    }

    .buttons {
      margin-top: 50px;
      display: flex;
      gap: 40px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 18px 40px;
      font-size: 22px;
      font-weight: bold;
      border: none;
      cursor: pointer;
      text-decoration: none;
      color: #000;
      min-width: 260px;
      text-align: center;
    }

    .btn-register {
      background: #b7ff6a; /* light green */
    }

    .btn-view {
      background: #ff2b2b; /* red */
      color: #000;
    }

    .btn:hover {
      opacity: 0.9;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="title">
      <span>🩸</span> Blood Donor Finder
    </div>

    <p class="subtitle">
      A public-use REST API to help people find<br/>
      blood donors quickly by blood group & city<br/>
      during medical emergencies.
    </p>

    <div class="buttons">
      <a class="btn btn-register" href="#">
        Register as a donor
      </a>

      <a class="btn btn-view" href="/api/donors" target="_blank">
        View Donors
      </a>
    </div>
  </div>
</body>
</html>
  `);
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
   VALIDATION
================================ */
const validBloodGroups = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
];

function validateDonor({ name, bloodGroup, city, phone }) {
  if (!name || name.trim() === "") return "Name is required";
  if (!city || city.trim() === "") return "City is required";
  if (!bloodGroup || !validBloodGroups.includes(bloodGroup))
    return "Invalid blood group";
  if (!phone || !/^[0-9]{10}$/.test(phone))
    return "Phone number must be 10 digits";
  return null;
}

/* ================================
   POST: REGISTER DONOR
================================ */
app.post("/api/donors", (req, res) => {
  const error = validateDonor(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error });
  }

  const newDonor = {
    id: donors.length + 1,
    name: req.body.name.trim(),
    bloodGroup: req.body.bloodGroup,
    city: req.body.city.trim(),
    phone: req.body.phone
  };

  donors.push(newDonor);

  res.status(201).json({ success: true, donor: newDonor });
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
   START SERVER
================================ */
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
