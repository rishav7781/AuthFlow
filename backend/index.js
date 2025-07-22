const express = require("express");
const pool = require("./db");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { generateToken } = require("./tokenUtils");
const swaggerDocs = require("./swagger");
const cors = require("cors");


require("dotenv").config();

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("users table checked/created");
  } catch (err) {
    console.error("Error creating users table:", err.message);
  }
})();

const app = express();

app.use(cors({
  origin: "http://127.0.0.1:5500",
  credentials: true
}));
// Middleware
app.use(express.json());
app.use(cookieParser());


swaggerDocs(app);


// Login route (Truecaller Mock)
app.post("/login", async (req, res) => {
  const { name, mobile, email, address } = req.body;
  if (!name || !mobile) {
    return res.status(400).json({ message: "Name & Mobile No required" });
  }
  // Additional validation: mobile must be 10 digits
  if (!/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ message: "Mobile number must be 10 digits" });
  }
  try {
    let result = await pool.query("SELECT * FROM users WHERE mobile = $1", [mobile]);
    let user;
    if (result.rows.length === 0) {
      const insertQuery = `INSERT INTO users (name, mobile, email, address) VALUES ($1, $2, $3, $4) RETURNING *`;
      result = await pool.query(insertQuery, [name, mobile, email, address]);
    }
    user = result.rows[0];
    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 90 * 24 * 60 * 60 * 1000,
      sameSite: 'lax' // or 'none' if using HTTPS
    });
    res.json({ message: "Login successful", user });
  } catch (err) {
    console.error("/login error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});
 
// Signup route
app.post('/signup', async (req, res) => {
  const { name, mobile, email, address } = req.body;
  // Input validation
  if (!name || !mobile || !email || !address) {
    return res.status(400).json({ message: 'All fields (name, mobile, email, address) are required' });
  }
  if (!/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ message: 'Mobile number must be 10 digits' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }
  try {
    // Check if user already exists by mobile or email
    const userExists = await pool.query(
      'SELECT * FROM users WHERE mobile = $1 OR email = $2',
      [mobile, email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists with given mobile or email' });
    }
    // Insert new user
    await pool.query(
      'INSERT INTO users (name, mobile, email, address) VALUES ($1, $2, $3, $4)',
      [name, mobile, email, address]
    );
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("/signup error:", error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});



// Profile route (protected)
/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile by JWT token
 *     description: Returns user details based on the token stored in cookie.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Successfully fetched profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 mobile:
 *                   type: string
 *                 email:
 *                   type: string
 *                 address:
 *                   type: string
 *       401:
 *         description: Unauthorized — Token missing or invalid
 */

app.get("/profile", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.id]);
    res.json(result.rows[0]);
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

// Contacts search route
app.post("/contacts/search", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { contacts } = req.body;

    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ message: "Contacts array required" });
    }

    const found = [];
    const notFound = [];

    for (let mobile of contacts) {
      const result = await pool.query("SELECT name, mobile FROM users WHERE mobile = $1", [mobile]);
      if (result.rows.length > 0) {
        found.push(result.rows[0]);
      } else {
        notFound.push(mobile);
      }
    }

    res.json({ found, notFound });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout route
app.post('/logout', (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});




app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
