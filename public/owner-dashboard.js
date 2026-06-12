let previousOrderCount = 0;
let firstLoad = true;

async function loadOrders() {
  const table = document.getElementById("ordersTable");

  try {
    const response = await fetch("https://your-backend-url.onrender.com/api/owner/orders");
    const orders = await response.json();

    if (!firstLoad && orders.length > previousOrderCount) {
      showNewOrderNotification();
    }

    previousOrderCount = orders.length;
    firstLoad = false;

    updateStats(orders);

    if (orders.length === 0) {
      table.innerHTML = `<tr><td colspan="8">No orders found.</td></tr>`;
      return;
    }

    table.innerHTML = orders.map(order => `
      <tr>
        <td><strong>${order.token_no}</strong></td>
        <td>
          ${order.student_name}<br>
          <small>${order.student_email}</small>
        </td>
        <td>${order.food_name}</td>
        <td>${order.quantity}</td>
        <td>₹${order.total_amount}</td>
        <td>${order.payment_method}</td>
        <td>
          <span class="status ${order.status}">
            ${order.status}
          </span>
        </td>
        <td>
          <button class="action-btn ready-btn" onclick="updateStatus(${order.id}, 'Ready')">Ready</button>
          <button class="action-btn delivered-btn" onclick="updateStatus(${order.id}, 'Delivered')">Delivered</button>
          <button class="action-btn cancel-btn" onclick="updateStatus(${order.id}, 'Cancelled')">Cancel</button>
        </td>
      </tr>
    `).join("");

  } catch (error) {
    table.innerHTML = `<tr><td colspan="8">Backend not connected.</td></tr>`;
  }
}

function updateStats(orders) {
  document.getElementById("totalOrders").innerText = orders.length;
  document.getElementById("preparingOrders").innerText =
    orders.filter(o => o.status === "Preparing").length;
  document.getElementById("readyOrders").innerText =
    orders.filter(o => o.status === "Ready").length;
  document.getElementById("deliveredOrders").innerText =
    orders.filter(o => o.status === "Delivered").length;
}

async function updateStatus(id, status) {
  await fetch(`http://localhost:5000/api/owner/orders/${id}/status`, {
    method:"PUT",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({ status })
  });

  loadOrders();
}

function showNewOrderNotification() {
  const toast = document.getElementById("orderToast");
  const totalCard = document.getElementById("totalOrders").parentElement;

  toast.classList.add("show");
  totalCard.classList.add("blink-badge");

  playNotificationSound();

  setTimeout(() => {
    toast.classList.remove("show");
    totalCard.classList.remove("blink-badge");
  }, 3000);
}

function playNotificationSound() {
  const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
  audio.play().catch(() => {});
}

loadOrders();

setInterval(loadOrders, 5000);