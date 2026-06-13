let allOrders = [];

function getFoodName(order) {
  if (order.foodName) return order.foodName;
  if (order.food_name) return order.food_name;

  if (order.items) {
    let items = order.items;

    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch {
        return items;
      }
    }

    if (Array.isArray(items)) {
      return items.map(item => {
        return `${item.foodName || item.food_name} x ${item.quantity}`;
      }).join(", ");
    }
  }

  return "No Food Name";
}

function getQuantity(order) {
  if (order.quantity) return order.quantity;
  if (order.qty) return order.qty;

  if (order.items) {
    let items = order.items;

    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch {
        return 0;
      }
    }

    if (Array.isArray(items)) {
      return items.reduce((sum, item) => {
        return sum + Number(item.quantity || 0);
      }, 0);
    }
  }

  return 0;
}

function getStudentName(order) {
  return order.studentName || order.student_name || "Student";
}

function getStudentEmail(order) {
  return order.studentEmail || order.student_email || "student@email.com";
}

function getTotal(order) {
  return order.totalAmount || order.total_amount || 0;
}

function getPayment(order) {
  return order.paymentMethod || order.payment_method || "Not Available";
}

function getToken(order) {
  return order.tokenNo || order.token_no || "No Token";
}

function getPickupTime(order) {
  console.log("FULL ORDER OBJECT:", order);

  return (
    order.pickup_time ||
    order.pickuptime ||
    order.pickupTime ||
    order.pickup_time_value ||
    order.pickup ||
    order.time ||
    order.pickupTimeValue ||
    "No Time"
  );
}

function getCounter(order) {
  return order.counter_name || order.counter || order.receiverPlace || order.receiver_place || "";
}

function renderOrders(orders) {
  const table = document.getElementById("ordersTable");

  if (orders.length === 0) {
    table.innerHTML = `<tr><td colspan="10">No matching orders found.</td></tr>`;
    return;
  }

  table.innerHTML = orders.map(order => `
    <tr>
      <td><strong>${getToken(order)}</strong></td>

      <td>
        ${getStudentName(order)}<br>
        <small>${getStudentEmail(order)}</small>
      </td>

      <td>${getFoodName(order)}</td>

      <td>${getQuantity(order)}</td>

      <td>₹${getTotal(order)}</td>

      <td>${getPayment(order)}</td>

      <td>${getPickupTime(order)}</td>

      <td>${getCounter(order)}</td>

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
}

async function loadOrders() {
  const table = document.getElementById("ordersTable");

  try {
    const response = await fetch("https://student-portal-backend-uo7y.onrender.com/api/owner/orders");
    const data = await response.json();
    const orders = Array.isArray(data) ? data : [];

    if (!response.ok) {
      throw new Error("Backend error");
    }

    allOrders = orders;
    updateStats(orders);

    const searchInput = document.getElementById("emailSearch");
    const searchValue = searchInput ? searchInput.value.toLowerCase() : "";

    if (searchValue !== "") {
      searchOrdersByEmail();
    } else {
      renderOrders(orders);
    }

  } catch (error) {
    console.error(error);
    table.innerHTML = `<tr><td colspan="8">Backend not connected.</td></tr>`;
  }
}

function searchOrdersByEmail() {
  let searchValue = document.getElementById("emailSearch").value.toLowerCase();

  let filteredOrders = allOrders.filter(order => {
    let email = getStudentEmail(order).toLowerCase();
    return email.includes(searchValue);
  });

  renderOrders(filteredOrders);
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
  await fetch(`https://student-portal-backend-uo7y.onrender.com/api/owner/orders/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status })
  });

  loadOrders();
}

loadOrders();
setInterval(loadOrders, 5000);