const express = require("express");

const app = express();

// middleware to read JSON
app.use(express.json());

// Dummy data (database samjho)
let users = [
  { id: 1, name: "Sahil", role: "Learner" }
];

// GET API
app.get("/api/users", (req, res) => {
  res.json(users);
});

// POST API
app.post("/api/users", (req, res) => {
  const newUser = {
    id: users.length + 1,
    name: req.body.name,
    role: req.body.role
  };

  users.push(newUser);

  res.json({
    message: "User added successfully",
    user: newUser
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});


