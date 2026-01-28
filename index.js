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
  name: String,
  bloodGroup: String,
  city: String,
  phone: String,
});

const Donor = mongoose.model("Donor", donorSchema);

/* ================================
   VALIDATION
================================ */
const validBloodGroups = [
  "A+","A-","B+","B-","AB+","AB-","O+","O-"
];

function validateDonor(d) {
  if (!d.name) return "Name is required";
  if (!validBloodGroups.includes(d.bloodGroup)) return "Invalid blood group";
  if (!d.city) return "City is required";
  if (!/^[0-9]{10}$/.test(d.phone)) return "Phone must be 10 digits";
  return null;
}

/* ================================
   HOME PAGE
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
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #fff;
    }
    .container {
      text-align: center;
      max-width: 700px;
    }
    h1 { font-size: 42px; }
    p { font-size: 18px; }
    .buttons {
      margin-top: 40px;
      display: flex;
      gap: 40px;
      justify-content: center;
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
      A public-use platform to find blood donors quickly
      during medical emergencies.
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
   REGISTER PAGE (THANK YOU + REDIRECT)
================================ */
app.get("/register", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Register Donor</title>
  <style>
    body {
      font-family: Arial;
      background: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .card {
      background: white;
      padding: 30px;
      width: 350px;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      text-align: center;
    }
    input, select {
      width: 100%;
      padding: 10px;
      margin: 10px 0;
    }
    button {
      width: 100%;
      padding: 12px;
      background: #e63946;
      color: white;
      border: none;
      cursor: pointer;
      font-size: 16px;
    }
    .error {
      color: red;
      margin-top: 10px;
    }
    .success {
      color: green;
      margin-top: 10px;
      font-weight: bold;
    }
  </style>
</head>

<body>
  <div class="card">
    <h2>🩸 Register as Donor</h2>

    <input id="name" placeholder="Name" />
    
    <select id="bloodGroup">
      <option value="">Select Blood Group</option>
      <option>A+</option><option>A-</option>
      <option>B+</option><option>B-</option>
      <option>AB+</option><option>AB-</option>
      <option>O+</option><option>O-</option>
    </select>

    <input id="city" placeholder="City" />
    <input id="phone" placeholder="Phone (10 digits)" />

    <button onclick="submitForm()">Submit</button>

    <div id="msg"></div>
  </div>

<script>
async function submitForm() {
  const name = document.getElementById("name").value.trim();
  const bloodGroup = document.getElementById("bloodGroup").value;
  const city = document.getElementById("city").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const msg = document.getElementById("msg");

  msg.innerHTML = "";

  if (!name || !bloodGroup || !city || !phone) {
    msg.innerHTML = "<div class='error'>All fields required</div>";
    return;
  }

  if (phone.length !== 10) {
    msg.innerHTML = "<div class='error'>Phone must be 10 digits</div>";
    return;
  }

  try {
    const res = await fetch("/api/donors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bloodGroup, city, phone })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.innerHTML = "<div class='error'>" + data.error + "</div>";
      return;
    }

    let seconds = 5;
    msg.innerHTML = "<div class='success'>Thank you for registering ❤️<br>Redirecting in " + seconds + "s</div>";

    const timer = setInterval(() => {
      seconds--;
      msg.innerHTML = "<div class='success'>Thank you for registering ❤️<br>Redirecting in " + seconds + "s</div>";
      if (seconds === 0) {
        clearInterval(timer);
        window.location.href = "/";
      }
    }, 1000);

  } catch (err) {
    msg.innerHTML = "<div class='error'>Server error</div>";
  }
}
</script>

</body>
</html>
`);
});

/* ================================
   VIEW DONORS PAGE
================================ */
app.get("/donors", async (req, res) => {
  const donors = await Donor.find();

  let rows = donors.map(d => `
    <tr>
      <td>${d.name}</td>
      <td>${d.bloodGroup}</td>
      <td>${d.city}</td>
      <td>${d.phone}</td>
    </tr>
  `).join("");

  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>View Donors</title>
  <style>
    body { font-family: Arial; padding: 30px; }
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
      color: white;
    }
  </style>
</head>
<body>
  <h2 style="text-align:center;">🩸 Registered Donors</h2>
  <table>
    <tr>
      <th>Name</th>
      <th>Blood Group</th>
      <th>City</th>
      <th>Phone</th>
    </tr>
    ${rows}
  </table>
</body>
</html>
`);
});

/* ================================
   API
================================ */
app.post("/api/donors", async (req, res) => {
  const error = validateDonor(req.body);
  if (error) return res.status(400).json({ success: false, message: error });

  const donor = new Donor(req.body);
  await donor.save();

  res.json({ success: true });
});

/* ================================
   SERVER
================================ */
app.listen(3000, () => {
  console.log("Server running");
});
