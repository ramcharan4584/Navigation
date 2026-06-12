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
      <a href="dashboard.html">🏠 Dashboard</a>
      <a href="#">📅 Weekly Menu</a>
      <a href="#">📍 Pickup Counters</a>
      <a href="#" onclick="showMyOrders()">🛒 My Orders</a>
        <div class="orders-dropdown" id="ordersDropdown">
          <p class="empty-orders">Click to load your orders</p>
        </div>
      <a href="#">🎫 Pickup Tokens</a>
      <a href="#">❤️ Favorites</a>
      <a href="#">🕒 Order History</a>
      <a href="#">💳 Wallet</a>
      <a href="#">🎁 Offers & Coupons</a>
      <a href="#">🔥 Most Ordered</a>
      <a href="#">⏳ Live Queue</a>
      <a href="#">☎ Contact Canteen</a>
      <a href="index.html">🚪 Logout</a>
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
  document
  .getElementById("ordersDropdown")
  .classList.toggle("active");
}
async function showMyOrders() {
  const ordersBox = document.getElementById("ordersDropdown");
  const studentEmail = localStorage.getItem("studentEmail") || "student@email.com";

  try {
    const response = await fetch(`http://localhost:5000/api/orders/${studentEmail}`);
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