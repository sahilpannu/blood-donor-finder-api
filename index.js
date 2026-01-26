require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================================
   MONGODB CONNECTION
================================ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

/* ================================
   DONOR MODEL
================================ */
const donorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  city: { type: String, required: true },
  phone: { type: String, required: true },
});

const Donor = mongoose.model("Donor", donorSchema);

/* ================================
   VALIDATION
================================ */
const validBloodGroups = [
  "A+","A-","B+","B-","AB+","AB-","O+","O-"
];

function validateDonor(d) {
  if (!d.name || d.name.trim() === "") return "Name is required";
  if (!d.city || d.city.trim() === "") return "City is required";
  if (!validBloodGroups.includes(d.bloodGroup)) return "Invalid blood group";
  if (!/^[0-9]{10}$/.test(d.phone)) return "Phone must be 10 digits";
  return null;
}

/* ================================
   LANDING PAGE
================================ */
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Blood Donor Finder</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .container {
      text-align: center;
      max-width: 700px;
    }
    h1 { font-size: 42px; }
    p {
      font-size: 18px;
      color: #333;
      line-height: 1.6;
    }
    .buttons {
      margin-top: 40px;
      display: flex;
      gap: 40px;
      justify-content: center;
      flex-wrap: wrap;
    }
    a {
      text-decoration: none;
      padding: 18px 40px;
      font-size: 22px;
      font-weight: bold;
      color: #000;
    }
    .register { background: #b7ff6a; }
    .view { background: #ff2b2b; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🩸 Blood Donor Finder</h1>
    <p>
      A public-use platform to help people find blood donors
      quickly by blood group and city during medical emergencies.
    </p>

    <div class="buttons">
      <a class="register" href="/register">Register as a Donor</a>
      <a class="view" href="/donors">View Donors</a>
    </div>
  </div>
</body>
</html>
  `);
});

/* ================================
   REGISTER PAGE
================================ */
app.get("/register", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Register Donor</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f7f7f7;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .form-box {
      background: #fff;
      padding: 30px;
      border-radius: 8px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    h2 { text-align: center; }
    input, select {
      width: 100%;
      padding: 12px;
      margin: 12px 0;
      font-size: 16px;
    }
    button {
      width: 100%;
      padding: 14px;
      font-size: 18px;
      font-weight: bold;
      background: #e63946;
      color: #fff;
      border: none;
      cursor: pointer;
    }
    .msg {
      margin-top: 15px;
      text-align: center;
      font-weight: bold;
    }
  </style>
</head>
<body>

<div class="form-box">
  <h2>🩸 Register as a Donor</h2>

  <form id="donorForm">
    <input name="name" placeholder="Full Name" required />

    <select name="bloodGroup" required>
      <option value="">Select Blood Group</option>
      <option value="A+">A+</option>
      <option value="A-">A-</option>
      <option value="B+">B+</option>
      <option value="B-">B-</option>
      <option value="AB+">AB+</option>
      <option value="AB-">AB-</option>
      <option value="O+">O+</option>
      <option value="O-">O-</option>
    </select>

    <input name="city" placeholder="City" required />
    <input name="phone" placeholder="Phone (10 digits)" required />

    <button type="submit">Submit</button>
  </form>

  <div class="msg" id="msg"></div>
</div>

<script>
const form = document.getElementById("donorForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    name: form.name.value,
    bloodGroup: form.bloodGroup.value,
    city: form.city.value,
    phone: form.phone.value
  };

  const res = await fetch("/api/donors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (result.success) {
    msg.style.color = "green";
    msg.innerText = "✅ Donor registered successfully";
    form.reset();
  } else {
    msg.style.color = "red";
    msg.innerText = "❌ " + result.message;
  }
});
</script>

</body>
</html>
  `);
});

/* ================================
   VIEW DONORS PAGE
================================ */
app.get("/donors", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>View Donors</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #fff;
      padding: 30px;
    }
    h2 { text-align: center; }
    .filters {
      display: flex;
      gap: 20px;
      justify-content: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    select, button {
      padding: 10px;
      font-size: 16px;
    }
    table {
      width: 100%;
      max-width: 900px;
      margin: auto;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: center;
    }
    th {
      background: #e63946;
      color: #fff;
    }
  </style>
</head>
<body>

<h2>🩸 Registered Blood Donors</h2>

<div class="filters">
  <select id="blood">
    <option value="">All Blood Groups</option>
    <option>A+</option><option>A-</option>
    <option>B+</option><option>B-</option>
    <option>AB+</option><option>AB-</option>
    <option>O+</option><option>O-</option>
  </select>

  <input id="city" placeholder="City" />
  <button onclick="loadDonors()">Search</button>
</div>

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Blood Group</th>
      <th>City</th>
      <th>Phone</th>
    </tr>
  </thead>
  <tbody id="tableBody"></tbody>
</table>

<script>
async function loadDonors() {
  const blood = document.getElementById("blood").value;
  const city = document.getElementById("city").value;

  let url = "/api/donors";
  const params = [];
  if (blood) params.push("bloodGroup=" + blood);
  if (city) params.push("city=" + city);
  if (params.length) url += "?" + params.join("&");

  const res = await fetch(url);
  const donors = await res.json();

  const body = document.getElementById("tableBody");
  body.innerHTML = "";

  donors.forEach(d => {
    body.innerHTML += \`
      <tr>
        <td>\${d.name}</td>
        <td>\${d.bloodGroup}</td>
        <td>\${d.city}</td>
        <td>\${d.phone}</td>
      </tr>
    \`;
  });
}

loadDonors();
</script>

</body>
</html>
  `);
});

/* ================================
   API ROUTES
================================ */
app.post("/api/donors", async (req, res) => {
  const error = validateDonor(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error });
  }

  const donor = new Donor(req.body);
  await donor.save();

  res.json({ success: true, donor });
});

app.get("/api/donors", async (req, res) => {
  const { bloodGroup, city } = req.query;
  const filter = {};
  if (bloodGroup) filter.bloodGroup = bloodGroup;
  if (city) filter.city = city;

  const donors = await Donor.find(filter);
  res.json(donors);
});

/* ================================
   SERVER
================================ */
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
