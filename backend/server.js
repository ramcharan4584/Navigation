const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Student Portal Backend Running");
});

app.post("/api/orders", async (req, res) => {
  try {
    const {
      studentName,
      studentEmail,
      foodName,
      quantity,
      totalAmount,
      paymentMethod,
      tokenNo,
      status,
      counter
    } = req.body;

    const result = await pool.query(
      `INSERT INTO canteen_orders
      (student_name, student_email, food_name, quantity, total_amount, payment_method, token_no, status, counter_name)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        studentName,
        studentEmail,
        foodName,
        quantity,
        totalAmount,
        paymentMethod,
        tokenNo,
        status,
        counter
      ]
    );

    res.json({
      success: true,
      order: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Order not saved",
      error: error.message
    });
  }
});

app.get("/api/orders/:email", async (req, res) => {
  try {
    const email = req.params.email;

    const result = await pool.query(
      `SELECT * FROM canteen_orders
       WHERE student_email = $1
       ORDER BY order_time DESC`,
      [email]
    );

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Orders not fetched"
    });
  }
});

app.get("/api/owner/orders", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM canteen_orders ORDER BY order_time DESC`
    );

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cannot fetch owner orders",
      error: error.message
    });
  }
});

app.put("/api/owner/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE canteen_orders
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    res.json({
      success: true,
      order: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Status not updated",
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});