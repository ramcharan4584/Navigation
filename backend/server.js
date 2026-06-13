const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");
const firebaseAdmin = require("firebase-admin");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Student Portal Backend Running");
});

const admin = require("firebase-admin");

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  })
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
    const { status, deliveryPerson, deliveryPersonId, cancelReason } = req.body;

    let notificationMessage = "";

    if (status === "Ready") {
      notificationMessage = "Your order is ready. Please collect it within 10 minutes.";
    }

    if (status === "Delivered") {
      if (!deliveryPerson || !deliveryPersonId) {
        return res.status(400).json({
          success: false,
          message: "Delivery person name and ID are required"
        });
      }

      notificationMessage =
        `Your order has been delivered by ${deliveryPerson}. Delivery Person ID: ${deliveryPersonId}`;
    }

    if (status === "Cancelled") {
      if (!cancelReason) {
        return res.status(400).json({
          success: false,
          message: "Cancellation reason is required"
        });
      }

      notificationMessage =
        `Your order has been cancelled. Reason: ${cancelReason}`;
    }

    const result = await pool.query(
      `UPDATE canteen_orders
       SET 
         status = $1,
         notification_message = COALESCE($2, notification_message),
         delivery_person = COALESCE($3, delivery_person),
         delivery_person_id = COALESCE($4, delivery_person_id),
         cancel_reason = COALESCE($5, cancel_reason)
       WHERE id = $6
       RETURNING *`,
      [
        status,
        notificationMessage,
        deliveryPerson || null,
        deliveryPersonId || null,
        cancelReason || null,
        id
      ]
    );

    const updatedOrder = result.rows[0];

const tokenResult = await pool.query(
  `SELECT fcm_token FROM student_fcm_tokens
   WHERE student_email = $1`,
  [updatedOrder.student_email]
);

if (tokenResult.rows.length > 0 && notificationMessage) {
  const fcmToken = tokenResult.rows[0].fcm_token;

  await firebaseAdmin.messaging().send({
    token: fcmToken,
    notification: {
      title: "UniEats Order Update",
      body: notificationMessage
    },
    webpush: {
      notification: {
        icon: "/images/logo.png"
      }
    }
  });
}

    res.json({
      success: true,
      order: updatedOrder
    });

  } catch (error) {
    console.error("Status update error:", error.message);

    res.status(500).json({
      success: false,
      message: "Status not updated",
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;

app.post("/api/save-fcm-token", async (req, res) => {
  try {
    const { studentEmail, fcmToken } = req.body;

    if (!studentEmail || !fcmToken) {
      return res.status(400).json({
        success: false,
        message: "studentEmail and fcmToken are required"
      });
    }

    await pool.query(
      `INSERT INTO student_fcm_tokens (student_email, fcm_token)
       VALUES ($1, $2)
       ON CONFLICT (student_email)
       DO UPDATE SET fcm_token = EXCLUDED.fcm_token`,
      [studentEmail, fcmToken]
    );

    res.json({
      success: true,
      message: "FCM token saved"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "FCM token not saved",
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
