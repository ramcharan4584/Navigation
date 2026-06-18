const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");

const { initializeApp, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");

const app = express();

app.use(cors());
app.use(express.json());

let firebaseReady = false;

try {
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      })
    });

    firebaseReady = true;
    console.log("Firebase Admin initialized successfully");
  } else {
    console.log("Firebase env variables missing. Notifications disabled.");
  }
} catch (error) {
  console.log("Firebase initialization failed:", error.message);
}

async function sendFCMNotification(email, title, body) {
  if (!firebaseReady) {
    console.log("Firebase not ready");
    return;
  }

  try {
    const tokenResult = await pool.query(
      `SELECT fcm_token FROM student_fcm_tokens 
       WHERE LOWER(student_email) = LOWER($1) 
       LIMIT 1`,
      [email]
    );

    if (tokenResult.rows.length === 0) {
      console.log(`No FCM token found in DB for ${email}`);
      return;
    }

    const userToken = tokenResult.rows[0].fcm_token;

    const response = await getMessaging().send({
      token: userToken,

      notification: {
        title,
        body
      },

      data: {
        title,
        body
      },

      webpush: {
      notification: {
        title,
        body,
        icon: "/logo.png",
        badge: "/logo.png",
        requireInteraction: true,
        tag: "unieats-order-update",
        renotify: true
      }
    }
    });

    console.log("Notification sent to email:", email);
    console.log("Notification sent to token:", userToken);
    console.log("Firebase response:", response);

  } catch (err) {
    console.error("FCM send failed:", err.message);
  }
}

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
      ownerNote,
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
    pickup_time,
    last_action_time,
    owner_note
  )
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,CURRENT_TIMESTAMP,$11)
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
    counter || receiverPlace,
    pickupTime || pickup_time,
    ownerNote || null
  ]
);

    const savedOrder = result.rows[0];

    await sendFCMNotification(
      studentEmail,
      "UniEats Order Confirmed",
      `Food: ${foodName}\nQuantity: ${quantity}\nTotal: ₹${totalAmount}\nToken No: ${tokenNo}\nPickup Time: ${pickupTime || pickup_time}\nPayment: ${paymentMethod}\nCounter: ${counter || receiverPlace}`
    );

    res.json({ success: true, order: savedOrder });

  } catch (error) {
    console.error("POST /api/orders error:", error.message);
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
      `SELECT * FROM canteen_orders WHERE student_email = $1 ORDER BY order_time DESC`,
      [email]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("GET /api/orders/:email error:", error.message);
    res.status(500).json({
      success: false,
      message: "Orders not fetched",
      error: error.message
    });
  }
});

app.get("/api/owner/orders", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id, student_name, student_email, food_name, quantity,
        total_amount, payment_method, token_no, status,
        counter_name, pickup_time, order_time,
        delivery_person, delivery_person_id, cancel_reason,
        notification_message,status_updated_at,owner_note
      FROM canteen_orders
      WHERE order_time >= CURRENT_DATE
        AND order_time < CURRENT_DATE + INTERVAL '1 day'
      ORDER BY order_time DESC`
    );

    res.json(result.rows);

  } catch (error) {
    console.error("GET /api/owner/orders error:", error.message);
    res.status(500).json({
      success: false,
      message: "Cannot fetch owner orders",
      error: error.message
    });
  }
});

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
   VALUES (LOWER($1), $2)
   ON CONFLICT (student_email)
   DO UPDATE SET fcm_token = EXCLUDED.fcm_token`,
  [studentEmail, fcmToken]
);

    res.json({ success: true, message: "FCM token saved" });

  } catch (error) {
    console.error("POST /api/save-fcm-token error:", error.message);
    res.status(500).json({
      success: false,
      message: "FCM token not saved",
      error: error.message
    });
  }
});

app.post("/api/test-notification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!firebaseReady) {
      return res.status(503).json({
        success: false,
        message: "Firebase not initialized"
      });
    }

    const tokenResult = await pool.query(
      `SELECT fcm_token FROM student_fcm_tokens 
       WHERE LOWER(student_email) = LOWER($1) 
       LIMIT 1`,
      [email]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No FCM token found for this email"
      });
    }

    const userToken = tokenResult.rows[0].fcm_token;
    const title = "UniEats Test Notification";
    const body = "FCM is working successfully.";

    const response = await getMessaging().send({
      token: userToken,

      data: {
        title,
        body
      },

      webpush: {
        headers: {
          Urgency: "high",
          TTL: "86400"
        },

        notification: {
          title,
          body,
          icon: "https://student-portal-1baed.web.app/logo.png",
          badge: "https://student-portal-1baed.web.app/logo.png",
          requireInteraction: true,
          tag: "unieats-test-" + Date.now(),
          renotify: true
        },

        fcmOptions: {
          link: "https://student-portal-1baed.web.app/canteen.html"
        }
      }
    });

    console.log("Test notification sent to email:", email);
    console.log("Test notification sent to token:", userToken);
    console.log("Firebase response:", response);

    res.json({
      success: true,
      message: "Test notification sent"
    });

  } catch (error) {
    console.error("POST /api/test-notification error:", error.message);

    res.status(500).json({
      success: false,
      message: "Test notification failed",
      error: error.message
    });
  }
});

app.put("/api/owner/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, deliveryPerson, deliveryPersonId, cancelReason} = req.body;

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
     cancel_reason = COALESCE($4, cancel_reason),
     status_updated_at = CURRENT_TIMESTAMP,
     delivered_at = CASE 
       WHEN $6 = 'Delivered' THEN CURRENT_TIMESTAMP 
       ELSE delivered_at 
     END
   WHERE id = $5
   RETURNING *`,
  [
    status,
    deliveryPerson || null,
    deliveryPersonId || null,
    finalCancelReason,
    id,
    status
  ]
);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const updatedOrder = result.rows[0];

    let notificationMessage = "";

    if (status === "Ready") {
      notificationMessage = `Your order is ready for pickup at ${updatedOrder.counter_name}. Please collect it within 5 minutes.`;
    } else if (status === "Delivered") {
      notificationMessage = "Your order has been delivered successfully. Thank You for Choosing UniEats!";
    } else if (status === "Cancelled") {
      notificationMessage = `Your order has been cancelled. Reason: ${finalCancelReason}`;
    }

    await pool.query(
      `UPDATE canteen_orders SET notification_message = $1 WHERE id = $2`,
      [notificationMessage, id]
    );

    if (notificationMessage) {
      await sendFCMNotification(
        updatedOrder.student_email,
        "UniEats Order Update",
        notificationMessage
      );
    }

    res.json({
      success: true,
      order: { ...updatedOrder, notification_message: notificationMessage }
    });

  } catch (error) {
    console.error("PUT /api/owner/orders/:id/status error:", error.message);
    res.status(500).json({
      success: false,
      message: "Status not updated",
      error: error.message
    });
  }
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception (non-fatal, server continuing):", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Promise Rejection (non-fatal, server continuing):", reason);
});

const nodemailer = require("nodemailer");
const cron = require("node-cron");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

async function sendDailyDeliveredOrdersReport() {
  try {
    const result = await pool.query(`
      SELECT *
      FROM canteen_orders
      WHERE status = 'Delivered'
      AND DATE(delivered_at) = CURRENT_DATE
      ORDER BY delivered_at DESC
    `);

    const orders = result.rows;

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + Number(order.total_amount || order.totalamount || 0);
    }, 0);

    let ordersHTML = orders.map(order => `
      <tr>
        <td>${order.token_no || order.tokenno}</td>
        <td>${order.student_name || order.studentname}</td>
        <td>${order.student_email || order.studentemail}</td>
        <td>${order.food_name || order.foodname}</td>
        <td>${order.quantity}</td>
        <td>₹${order.total_amount || order.totalamount}</td>
        <td>${order.payment_method || order.paymentmethod}</td>
        <td>${order.counter_name || "Not entered"}</td>
        <td>${order.delivery_person || "Not entered"}</td>
        <td>${order.delivery_person_id || "Not entered"}</td>
        <td>${order.delivered_at}</td>
      </tr>
    `).join("");

    const html = `
      <h2>UniEats Daily Delivered Orders Report</h2>

      <h3>Daily Stats</h3>
      <p><strong>Total Delivered Orders:</strong> ${totalOrders}</p>
      <p><strong>Total Revenue:</strong> ₹${totalRevenue}</p>

      <table border="1" cellpadding="8" cellspacing="0">
        <thead>
          <tr>
            <th>Token</th>
            <th>Student Name</th>
            <th>Student Email</th>
            <th>Food Items</th>
            <th>Qty</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Counter</th>
            <th>Delivery Person</th>
            <th>Delivery ID</th>
            <th>Delivered At</th>
          </tr>
        </thead>
        <tbody>
          ${ordersHTML || `<tr><td colspan="11">No delivered orders today</td></tr>`}
        </tbody>
      </table>
    `;

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: process.env.OWNER_EMAIL,
      subject: "UniEats Daily Delivered Orders Report",
      html
    });

    console.log("Daily delivered orders email sent");
  } catch (error) {
    console.error("Email report failed:", error.message);
  }
}

cron.schedule("59 23 * * *", () => {
  sendDailyDeliveredOrdersReport();
}, {
  timezone: "Asia/Kolkata"
});

app.get("/api/test-daily-report", async (req, res) => {
  await sendDailyDeliveredOrdersReport();
  res.json({ success: true, message: "Daily report test triggered" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});