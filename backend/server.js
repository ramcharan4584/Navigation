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
      counter,
      receiverPlace,
      pickupTime,
      pickup_time
    } = req.body;

    const result = await pool.query(
      `INSERT INTO canteen_orders
      (student_name, student_email, food_name, quantity, total_amount, payment_method, token_no, status, counter_name, pickup_time)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
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
        counter || receiverPlace,
        pickupTime || pickup_time
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
  `SELECT 
    id,
    student_name,
    student_email,
    food_name,
    quantity,
    total_amount,
    payment_method,
    token_no,
    status,
    counter_name,
    pickup_time,
    order_time
  FROM canteen_orders
  ORDER BY order_time DESC`
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
    const { status, deliveryPerson, cancelReason } = req.body;

    let notificationMessage = "";
    let deliveryId = null;

    if (status === "Ready") {
      notificationMessage = "Your order is ready. Please pick it up within 10 minutes.";
    }

    if (status === "Delivered") {
      if (!deliveryPerson) {
        return res.status(400).json({
          success: false,
          message: "Delivery person name is required"
        });
      }

      deliveryId = "DEL-" + Date.now();
      notificationMessage = `Your order has been delivered by ${deliveryPerson}. Delivery ID: ${deliveryId}`;
    }

    if (status === "Cancelled") {
      if (!cancelReason) {
        return res.status(400).json({
          success: false,
          message: "Cancel reason is required"
        });
      }

      notificationMessage = `Your order has been cancelled. Reason: ${cancelReason}`;
    }

    const result = await pool.query(
      `UPDATE canteen_orders
       SET status = $1,
           notification_message = $2,
           delivery_person = $3,
           delivery_id = $4,
           cancel_reason = $5
       WHERE id = $6
       RETURNING *`,
      [
        status,
        notificationMessage,
        deliveryPerson || null,
        deliveryId,
        cancelReason || null,
        id
      ]
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