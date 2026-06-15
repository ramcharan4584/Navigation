const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");

const { initializeApp, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");

const app = express();

app.use(cors());
app.use(express.json());

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  })
});

app.get("/", (req, res) => {
  res.send("Student Portal Backend Running");
});

// SAVE NEW ORDER
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

    const finalPickupTime = pickupTime || pickup_time;
    const finalCounter = counter || receiverPlace || "Main Cafeteria";

    const result = await pool.query(
      `INSERT INTO canteen_orders
      (
        student_name,
        student_email,
        food_name,
        quantity,
        total_amount,
        payment_method,
        token_no,
        status,
        counter_name,
        pickup_time
      )
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
        status || "Preparing",
        finalCounter,
        finalPickupTime
      ]
    );

    const savedOrder = result.rows[0];

    const tokenResult = await pool.query(
      `SELECT DISTINCT fcm_token 
       FROM student_fcm_tokens
       WHERE student_email = $1`,
      [studentEmail]
    );

    const messageBody = `Food: ${foodName}
Quantity: ${quantity}
Total: ₹${totalAmount}
Token No: ${tokenNo}
Pickup Time: ${finalPickupTime}
Payment: ${paymentMethod}
Counter: ${finalCounter}`;

    for (const row of tokenResult.rows) {
      await getMessaging().send({
        token: row.fcm_token,
        data: {
          title: "UniEats Order Confirmed",
          body: messageBody
        }
      });

      console.log("Order confirmation sent to:", row.fcm_token);
    }

    res.json({
      success: true,
      order: savedOrder
    });

  } catch (error) {
    console.error("Order save error:", error.message);

    res.status(500).json({
      success: false,
      message: "Order not saved",
      error: error.message
    });
  }
});

// STUDENT ORDERS
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
      message: "Orders not fetched",
      error: error.message
    });
  }
});

// OWNER ORDERS
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
        order_time,
        delivery_person,
        delivery_person_id,
        cancel_reason,
        notification_message
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

// SAVE FCM TOKEN
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
      `INSERT INTO student_fcm_tokens 
       (student_email, fcm_token)
       VALUES ($1, $2)
       ON CONFLICT (fcm_token)
       DO UPDATE SET student_email = EXCLUDED.student_email`,
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

// TEST NOTIFICATION
app.post("/api/test-notification", async (req, res) => {
  try {
    const { email } = req.body;

    const tokenResult = await pool.query(
      `SELECT DISTINCT fcm_token 
       FROM student_fcm_tokens
       WHERE student_email = $1`,
      [email]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No FCM token found for this email"
      });
    }

    for (const row of tokenResult.rows) {
      await getMessaging().send({
        token: row.fcm_token,
        data: {
          title: "UniEats Test Notification",
          body: "FCM is working successfully."
        }
      });
    }

    res.json({
      success: true,
      message: "Test notification sent"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Test notification failed",
      error: error.message
    });
  }
});

// UPDATE ORDER STATUS
app.put("/api/owner/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, deliveryPerson, deliveryPersonId, cancelReason } = req.body;

    let finalCancelReason = cancelReason || null;

    if (status === "Delivered") {
      if (!deliveryPerson || !deliveryPersonId) {
        return res.status(400).json({
          success: false,
          message: "Delivery person name and ID are required"
        });
      }
    }

    if (status === "Cancelled") {
      finalCancelReason = cancelReason || "No reason provided";
    }

    const result = await pool.query(
      `UPDATE canteen_orders
       SET 
         status = $1,
         delivery_person = COALESCE($2, delivery_person),
         delivery_person_id = COALESCE($3, delivery_person_id),
         cancel_reason = COALESCE($4, cancel_reason)
       WHERE id = $5
       RETURNING *`,
      [
        status,
        deliveryPerson || null,
        deliveryPersonId || null,
        finalCancelReason,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const updatedOrder = result.rows[0];

    let notificationMessage = "";

    if (status === "Ready") {
      notificationMessage = `Your order is ready for pickup at ${updatedOrder.counter_name}. Please collect it within 5 minutes.`;
    }

    if (status === "Delivered") {
      notificationMessage = "Your order has been delivered successfully. Thank you for using UniEats.";
    }

    if (status === "Cancelled") {
      notificationMessage = `Your order has been cancelled. Reason: ${finalCancelReason}`;
    }

    await pool.query(
      `UPDATE canteen_orders
       SET notification_message = $1
       WHERE id = $2`,
      [notificationMessage, id]
    );

    if (notificationMessage) {
      const tokenResult = await pool.query(
        `SELECT DISTINCT fcm_token 
         FROM student_fcm_tokens
         WHERE student_email = $1`,
        [updatedOrder.student_email]
      );

      for (const row of tokenResult.rows) {
        await getMessaging().send({
          token: row.fcm_token,
          data: {
            title: "UniEats Order Update",
            body: notificationMessage
          }
        });

        console.log("Status notification sent to:", row.fcm_token);
      }
    }

    res.json({
      success: true,
      order: {
        ...updatedOrder,
        notification_message: notificationMessage
      }
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});