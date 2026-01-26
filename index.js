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
      font-family: Arial, sans-serif;
      background: #f7f7f7;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .box {
      background: #fff;
      padding: 30px;
      border-radius: 8px;
      width: 420px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      text-align: center;
    }
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
      background: #e63946;
      color: #fff;
      border: none;
      cursor: pointer;
    }
    .msg {
      margin-top: 20px;
      font-weight: bold;
    }
  </style>
</head>
<body>

<div class="box" id="box">
  <h2>🩸 Register as a Donor</h2>

  <form id="donorForm">
    <input name="name" placeholder="Full Name" required />

    <select name="bloodGroup" required>
      <option value="">Select Blood Group</option>
      <option>A+</option><option>A-</option>
      <option>B+</option><option>B-</option>
      <option>AB+</option><option>AB-</option>
      <option>O+</option><option>O-</option>
    </select>

    <input name="city" placeholder="City" required />
    <input name="phone" placeholder="Phone (10 digits)" required />

    <button type="submit">Submit</button>
  </form>

  <div class="msg" id="msg"></div>
</div>

<script>
const form = document.getElementById("donorForm");
const box = document.getElementById("box");
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
    let seconds = 5;

    box.innerHTML = \`
      <h2>✅ Thank You!</h2>
      <p>You are successfully registered as a blood donor.</p>
      <p>Redirecting to home page in <b id="timer">5</b> seconds...</p>
    \`;

    const timer = document.getElementById("timer");

    const interval = setInterval(() => {
      seconds--;
      timer.innerText = seconds;
      if (seconds === 0) {
        clearInterval(interval);
        window.location.href = "/";
      }
    }, 1000);
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
