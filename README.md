# 🩸 Blood Donor Finder API

A public-use REST API built with Node.js and Express to help people quickly find blood donors by blood group and city during medical emergencies.

---

## 🚨 Problem Statement
During medical emergencies, finding the right blood donor on time can be extremely difficult. Many people depend on phone calls, WhatsApp groups, or personal contacts, which is slow and unreliable.

---

## 💡 Solution
This API allows:
- Donors to register their details
- Patients or hospitals to search donors by blood group and city
- Quick access to donor contact information during emergencies

---

## ⚙️ Tech Stack
- Node.js
- Express.js
- REST API
- Git & GitHub

---

## 📌 Features
- Register blood donors
- Search donors by blood group and city
- Delete donor records (admin use)
- Lightweight and fast API

---

## 🔗 API Endpoints

### ➕ Register a Donor
**POST** `/api/donors`

Request Body (JSON):
```json
{
  "name": "Ravi",
  "bloodGroup": "A+",
  "city": "Delhi",
  "phone": "9876543210"
}
