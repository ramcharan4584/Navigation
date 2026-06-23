const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");
const axios = require("axios");

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

  console.error(
    "FCM send failed:",
    err.code || err.message
  );

  if (
    err.code === "messaging/registration-token-not-registered" ||
    err.message.includes("NotRegistered")
  ) {

    await pool.query(
      `DELETE FROM student_fcm_tokens
       WHERE fcm_token = $1`,
      [userToken]
    );

    console.log("Expired FCM token removed");
  }
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

    const studentPhoneResult = await pool.query(
  `SELECT phone FROM students 
   WHERE LOWER(email) = LOWER($1)
   LIMIT 1`,
  [studentEmail]
);

console.log("WhatsApp order email:", studentEmail);
console.log("WhatsApp phone DB result:", studentPhoneResult.rows);

const studentPhone = studentPhoneResult.rows[0]?.phone;

console.log("WhatsApp final phone:", studentPhone);

if (studentPhone) {
  await sendWhatsAppMessage(studentPhone);
//   await sendWhatsAppMessage(
//     studentPhone,
//     `🎓 College Portal

// 🍽 UniEats Order Confirmed

// Your food order has been placed successfully.

// Food: ${foodName}
// Quantity: ${quantity}
// Total: ₹${totalAmount}
// Token No: ${tokenNo}
// Pickup Time: ${pickupTime || pickup_time}
// Payment: ${paymentMethod}
// Counter: ${counter || receiverPlace}

// Thank you for Choosing College Portal.`
//   );
} else {
  console.log("No phone number found for:", studentEmail);
}

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

async function sendWhatsAppMessage(phone) {
  try {
    const cleanPhone = phone.replace(/\D/g, "");

    const response = await axios.post(
      `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: cleanPhone,
        type: "template",
        template: {
          name: "hello_world",
          language: {
            code: "en_US"
          }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("WhatsApp sent:", response.data);

  } catch (error) {
    console.error(
      "WhatsApp error:",
      JSON.stringify(error.response?.data || error.message, null, 2)
    );
  }
}

app.put("/api/owner/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      deliveryPerson,
      deliveryPersonId,
      cancelReason
    } = req.body;

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
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const updatedOrder = result.rows[0];

    let notificationMessage = "";

    if (status === "Ready") {
      notificationMessage =
        `Your order is ready for pickup at ${updatedOrder.counter_name}. Please collect it within 5 minutes.`;
    } else if (status === "Delivered") {
      notificationMessage =
        "Your order has been delivered successfully. Thank You for Choosing UniEats!";
    } else if (status === "Cancelled") {
      notificationMessage =
        `Your order has been cancelled. Reason: ${finalCancelReason}`;
    }

    await pool.query(
      `UPDATE canteen_orders 
       SET notification_message = $1 
       WHERE id = $2`,
      [notificationMessage, id]
    );

    if (notificationMessage) {
      await sendFCMNotification(
        updatedOrder.student_email,
        "UniEats Order Update",
        notificationMessage
      );

      const studentPhoneResult = await pool.query(
        `SELECT phone FROM students
         WHERE LOWER(email) = LOWER($1)
         LIMIT 1`,
        [updatedOrder.student_email]
      );

      const studentPhone =
        studentPhoneResult.rows[0]?.phone;

      if (studentPhone) {
       await sendWhatsAppMessage(
  studentPhone,
  "UniEats Order Update",
  `${notificationMessage}

Token No: ${updatedOrder.token_no}
Counter: ${updatedOrder.counter_name}`,
  status
);
      } else {
        console.log(
          "No WhatsApp phone number found for:",
          updatedOrder.student_email
        );
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
    console.error(
      "PUT /api/owner/orders/:id/status error:",
      error.message
    );

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

app.get("/api/most-ordered-foods", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        food_name,
        COUNT(*) AS total_orders
      FROM canteen_orders
      WHERE 
        status != 'Cancelled'
        AND food_name IS NOT NULL
        AND TRIM(food_name) != ''
        AND food_name != 'null'
      GROUP BY food_name
      ORDER BY total_orders DESC
      LIMIT 10
    `);

    res.json(result.rows);

  } catch (error) {
    console.error("Most ordered foods error:", error);
    res.status(500).json({
      success: false,
      message: "Cannot fetch most ordered foods"
    });
  }
});

app.post("/api/students/save", async (req, res) => {
  try {
    const {
      name,
      roll_number,
      branch,
      year,
      email,
      phone
    } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const result = await pool.query(
      `INSERT INTO students 
       (name, roll_number, branch, year, email, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email)
       DO UPDATE SET
         name = EXCLUDED.name,
         roll_number = EXCLUDED.roll_number,
         branch = EXCLUDED.branch,
         year = EXCLUDED.year,
         phone = EXCLUDED.phone
       RETURNING *`,
      [name, roll_number, branch, year, email, phone]
    );

    res.json({
      success: true,
      message: "Student profile saved",
      student: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save student profile",
      error: error.message
    });
  }
});

app.get("/api/test-whatsapp", async (req, res) => {
  await sendWhatsAppMessage("917993610936");
  res.send("WhatsApp hello_world test triggered");
});
//   await sendWhatsAppMessage(
//     "917993610936",
//     `🎓 College Portal

// ✅ WhatsApp notification system is active.

// You will receive:
// 🍽 Canteen order updates
// 📅 Event reminders
// 📝 Exam notifications
// 💰 Wallet alerts`
//   );

//   res.send("College Portal WhatsApp test sent");

async function getStudentPhone(email) {
  const result = await pool.query(
    `SELECT phone FROM students
     WHERE LOWER(email) = LOWER($1)
     LIMIT 1`,
    [email]
  );

  return result.rows[0]?.phone;
}

app.post("/api/whatsapp/event", async (req, res) => {
  try {
    const { email, eventTitle, eventDate, eventTime, venue } = req.body;

    const phone = await getStudentPhone(email);

    if (!phone) {
      return res.status(404).json({
        success: false,
        message: "Student phone not found"
      });
    }

    await sendWhatsAppMessage(
      phone,
      `🎓 College Portal

📅 Event Reminder

${eventTitle}

Date: ${eventDate}
Time: ${eventTime}
Venue: ${venue}

Don't miss it!`
    );

    res.json({
      success: true,
      message: "Event WhatsApp notification sent"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Event notification failed",
      error: error.message
    });
  }
});

app.post("/api/whatsapp/exam", async (req, res) => {
  try {
    const { email, subject, examDate, examTime, room } = req.body;

    const phone = await getStudentPhone(email);

    if (!phone) {
      return res.status(404).json({
        success: false,
        message: "Student phone not found"
      });
    }

    await sendWhatsAppMessage(
      phone,
      `🎓 College Portal

📝 Exam Notification

Subject: ${subject}
Date: ${examDate}
Time: ${examTime}
Room: ${room}

All the best!`
    );

    res.json({
      success: true,
      message: "Exam WhatsApp notification sent"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Exam notification failed",
      error: error.message
    });
  }
});

app.post("/api/wallet/add-money", async (req, res) => {
  try {
    const { email, amount } = req.body;

    const result = await pool.query(
      `UPDATE students
       SET wallet_balance =
       COALESCE(wallet_balance, 0) + $1
       WHERE LOWER(email) = LOWER($2)
       RETURNING wallet_balance`,
      [amount, email]
    );

    const newBalance =
      result.rows[0].wallet_balance;

    const phone = await getStudentPhone(email);

    if (phone) {
      await sendWhatsAppMessage(
        phone,
        `🎓 College Portal

💰 Wallet Credited

₹${amount} has been added to your wallet.

Available Balance: ₹${newBalance}

Thank you for Choosing College Portal.`
      );
    }

    res.json({
      success: true,
      balance: newBalance
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Wallet recharge failed",
      error: error.message
    });
  }
});

app.post("/api/wallet/debit", async (req, res) => {
  try {
    const { email, amount, purpose } = req.body;

    const result = await pool.query(
      `UPDATE students
       SET wallet_balance =
       COALESCE(wallet_balance, 0) - $1
       WHERE LOWER(email) = LOWER($2)
       RETURNING wallet_balance`,
      [amount, email]
    );

    const newBalance =
      result.rows[0].wallet_balance;

    const phone = await getStudentPhone(email);

    if (phone) {
      await sendWhatsAppMessage(
        phone,
        `🎓 College Portal

💳 Wallet Debited

₹${amount} has been debited from your wallet.

Purpose: ${purpose}

Available Balance: ₹${newBalance}`
      );
    }

    res.json({
      success: true,
      balance: newBalance
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Wallet debit failed",
      error: error.message
    });
  }
});

const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const PORT = process.env.PORT || 5000;

app.post("/api/whatsapp/payment-receipt", async (req, res) => {
  try {
    const {
      email,
      amount,
      tokenNo,
      paymentMethod,
      purpose
    } = req.body;

    const phone = await getStudentPhone(email);

    if (!phone) {
      return res.status(404).json({
        success: false,
        message: "Student phone not found"
      });
    }

    await sendWhatsAppMessage(
      phone,
      "💳 Payment Receipt",
      `Amount: ₹${amount}
Purpose: ${purpose}
Token No: ${tokenNo}
Payment Method: ${paymentMethod}`,
      "Paid"
    );

    res.json({
      success: true,
      message: "Payment receipt sent"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Payment receipt failed",
      error: error.message
    });
  }
});

const crypto = require("crypto");

const ownerOtpStore = new Map();

const OWNER_ID = process.env.OWNER_ID || "Ramm";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || "Ramm@1116";
const OWNER_PHONE = process.env.OWNER_PHONE || "917993610936";

app.post("/api/owner/send-otp", async (req, res) => {
  try {
    const { ownerId, password } = req.body;

    if (ownerId !== OWNER_ID || password !== OWNER_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: "Invalid owner credentials"
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    ownerOtpStore.set(ownerId, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    console.log("OWNER OTP:", otp);

    // Later we can connect this with WhatsApp/SMS API
    // For now OTP will appear in Render logs

    res.json({
      success: true,
      message: "OTP sent successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message
    });
  }
});

app.post("/api/owner/verify-otp", (req, res) => {
  try {
    const { ownerId, otp } = req.body;

    const savedOtp = ownerOtpStore.get(ownerId);

    if (!savedOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired"
      });
    }

    if (Date.now() > savedOtp.expiresAt) {
      ownerOtpStore.delete(ownerId);

      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    if (savedOtp.otp !== otp) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    ownerOtpStore.delete(ownerId);

    res.json({
      success: true,
      message: "Owner verified successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: error.message
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

app.post("/api/payments/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: `unieats_${Date.now()}`
    });

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Payment order creation failed",
      error: error.message
    });
  }
});

app.post("/api/payments/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }

    res.json({
      success: true,
      message: "Payment verified successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Payment verification error",
      error: error.message
    });
  }
});