const diningNavbar = document.getElementById("dining-navbar-container");

diningNavbar.innerHTML = `
  <div class="dining-navbar">
    <div class="nav-left">
      <h2>🍽 Campus Dining</h2>
    </div>

    <div class="nav-right">
      <div class="menu-btn" onclick="openDiningSidebar()">
        <i class="fa-solid fa-bars"></i>
      </div>
    </div>
  </div>

  <div class="sidebar-overlay" id="sidebarOverlay" onclick="closeDiningSidebar()"></div>

  <div class="dining-sidebar" id="diningSidebar">
    <div class="sidebar-top">
      <span onclick="closeDiningSidebar()">
        <i class="fa-solid fa-xmark"></i>
      </span>
    </div>

    <div class="sidebar-links">
      <a href="dashboard.html">Dashboard</a>
      <a href="#">Weekly Menu</a>
      <a href="my-orders.html">Your Orders</a>
      <a href="#>Favorites</a>
      <a href="#">Order History</a>
      <a href="#">Wallet</a>
      <a href="#">Offers & Coupons</a>
      <a href="mostordered.html">Most Ordered</a>
      <a href="#">Live Queue</a>

      <a href="javascript:void(0)" id="notificationLink" onclick="enableNotifications()">
        Enable Order Notifications
      </a>

      <a href="#">Contact Canteen</a>
      <a href="index.html">Logout</a>
    </div>
  </div>
`;

function openDiningSidebar() {
  document.getElementById("diningSidebar").classList.add("active");
  document.getElementById("sidebarOverlay").classList.add("active");
}

function closeDiningSidebar() {
  document.getElementById("diningSidebar").classList.remove("active");
  document.getElementById("sidebarOverlay").classList.remove("active");
}

function toggleOrders() {
  document.getElementById("ordersDropdown").classList.toggle("active");
}

async function showMyOrders() {
  const ordersBox = document.getElementById("ordersDropdown");

  const studentEmail =
    localStorage.getItem("studentEmail") ||
    localStorage.getItem("userEmail");

  if (!studentEmail) {
    alert("Student email not found. Please login again.");
    return;
  }

  try {
    const response = await fetch(
      `https://student-portal-backend-uo7y.onrender.com/api/orders/${studentEmail}`
    );

    const orders = await response.json();

    if (orders.length === 0) {
      ordersBox.innerHTML = `<p class="empty-orders">No previous orders found.</p>`;
    } else {
      ordersBox.innerHTML = orders.map(order => `
        <div class="profile-order-card">
          <h4>${order.food_name}</h4>
          <p><strong>Qty:</strong> ${order.quantity}</p>
          <p><strong>Total:</strong> ₹${order.total_amount}</p>
          <p><strong>Token:</strong> ${order.token_no}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Counter:</strong> ${order.counter_name}</p>
        </div>
      `).join("");
    }

    ordersBox.classList.toggle("active");

  } catch (error) {
    ordersBox.innerHTML = `<p class="empty-orders">Unable to load orders.</p>`;
    ordersBox.classList.add("active");
  }
}

const messaging = firebase.messaging();

const vapidKey =
  "BHjO5qV1g41Mvrtqk-Jp08v9G7VQ44LpH_KAMZzwMZxpKlYdRrOL4zxDt1_oFGcVT6EJEQM_4WvmVNS-xq-QKnM";

async function enableNotifications() {
  try {

    if (Notification.permission === "denied") {
      alert(
        "Notifications are blocked.\n\n" +
        "Please allow them manually:\n\n" +
        "1. Click the lock icon near URL\n" +
        "2. Open Site Settings\n" +
        "3. Allow Notifications\n" +
        "4. Refresh the page"
      );

      return;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      alert("Notification permission not granted.");
      return;
    }

    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    const token = await messaging.getToken({
      vapidKey: vapidKey,
      serviceWorkerRegistration: registration
    });

    console.log("FCM TOKEN:", token);

    localStorage.setItem("fcmToken", token);

    const studentEmail =
      localStorage.getItem("studentEmail") ||
      localStorage.getItem("userEmail");

    if (!studentEmail) {
      alert("Student email not found. Please login again.");
      return;
    }

    console.log("EMAIL:", studentEmail);

    const response = await fetch(
      "https://student-portal-backend-uo7y.onrender.com/api/save-fcm-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentEmail: studentEmail,
          fcmToken: token
        })
      }
    );

    const data = await response.json();

    console.log("SAVE TOKEN RESPONSE:", data);

    if (data.success) {
      localStorage.setItem("notificationsEnabled", "true");
      localStorage.setItem("notificationEmail", studentEmail);

      updateNotificationUI();

      alert("Notifications enabled and saved successfully.");
    } else {
      alert(data.message || "Notification token not saved.");
    }

  } catch (error) {
    console.error("FCM ERROR:", error);
    alert("Token generation failed. Check console.");
  }
}

function updateNotificationUI() {
  const link = document.getElementById("notificationLink");

  if (!link) return;

  const enabled = localStorage.getItem("notificationsEnabled") === "true";
  const savedEmail = localStorage.getItem("notificationEmail");

  const currentEmail =
    localStorage.getItem("studentEmail") ||
    localStorage.getItem("userEmail");

  if (savedEmail && currentEmail && savedEmail !== currentEmail) {
    localStorage.removeItem("notificationsEnabled");
    localStorage.removeItem("notificationEmail");
    localStorage.removeItem("fcmToken");
  }

  if (
    enabled &&
    savedEmail === currentEmail &&
    Notification.permission === "granted"
  ) {
    link.innerHTML = "✅ Order Notifications Enabled";
    link.style.background = "#dcfce7";
    link.style.color = "#166534";
  } else {
    link.innerHTML = "🔔 Enable Order Notifications";
    link.style.background = "";
    link.style.color = "";
  }
}

async function autoSaveNotificationToken() {
  try {
    if (Notification.permission !== "granted") {
      return;
    }

    const studentEmail =
      localStorage.getItem("studentEmail") ||
      localStorage.getItem("userEmail");

    if (!studentEmail) return;

    const savedEmail = localStorage.getItem("notificationEmail");

    if (savedEmail === studentEmail && localStorage.getItem("fcmToken")) {
      return;
    }

    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    const token = await messaging.getToken({
      vapidKey: vapidKey,
      serviceWorkerRegistration: registration
    });

    await fetch("https://student-portal-backend-uo7y.onrender.com/api/save-fcm-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        studentEmail: studentEmail,
        fcmToken: token
      })
    });

    localStorage.setItem("fcmToken", token);
    localStorage.setItem("notificationsEnabled", "true");
    localStorage.setItem("notificationEmail", studentEmail);

    updateNotificationUI();

    console.log("Notification token auto-updated for:", studentEmail);

  } catch (error) {
    console.log("Auto token update skipped:", error.message);
  }
}

window.addEventListener("load", () => {
  updateNotificationUI();
  autoSaveNotificationToken();
});