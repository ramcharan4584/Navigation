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

function getOrderAge(order) {
  const timeToUse = order.status_updated_at || order.order_time;

  const now = new Date();
  const orderDate = new Date(timeToUse);

  const diffMs = now - orderDate;
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} mins ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hrs ago`;

  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

function getReadyWarning(order) {

  if (order.status !== "Ready") {
    return "";
  }

  const readyTime = new Date(
    order.status_updated_at || order.order_time
  );

  const now = new Date();

  const diffMinutes = Math.floor(
    (now - readyTime) / 60000
  );

  if (diffMinutes >= 10) {
    return `
      <div class="ready-warning">
        ⚠ Not collected yet
      </div>
    `;
  }

  return "";
}

function renderOrders(orders) {
  const table = document.getElementById("ordersTable");

  if (orders.length === 0) {
    table.innerHTML = `<tr><td colspan="10">No orders found.</td></tr>`;
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

      <td>${getOrderAge(order)}</td>

      <td>
        <span class="status ${order.status}">
          ${order.status}
        </span>

            ${
              order.owner_note
                ? `<br><br><small>Note: ${order.owner_note}</small>`
                : ""
            }

            ${getReadyWarning(order)}

            ${
              order.delivery_person
                ? `<br> <br> <small>By: ${order.delivery_person}</small>`
                : ""
            }

            ${
              order.cancel_reason
                ? `<br> <br> <small>Reason: ${order.cancel_reason}</small>`
                : ""
            }
      </td>

      <td>
        ${
          order.status === "Preparing"
            ? `
              <button class="action-btn ready-btn" onclick="updateStatus(${order.id}, 'Ready')">Ready</button>
              <button class="action-btn cancel-btn" onclick="updateStatus(${order.id}, 'Cancelled')">Cancel</button>
            `
            : order.status === "Ready"
            ? `
              <button class="action-btn delivered-btn" onclick="updateStatus(${order.id}, 'Delivered')">Delivered</button>
              <button class="action-btn cancel-btn" onclick="updateStatus(${order.id}, 'Cancelled')">Cancel</button>
            `
            : `
              <span class="locked-status">Status Locked</span>
            `
        }
      </td>
    </tr>
  `).join("");
}

async function loadOrders(updateTime = true) {
  const table = document.getElementById("ordersTable");

  try {
    const response = await fetch("https://student-portal-backend-uo7y.onrender.com/api/owner/orders");
    const data = await response.json();
    const orders = Array.isArray(data) ? data : [];

    if (!response.ok) {
      throw new Error("Backend error");
    }

    allOrders = orders;
    updateStats(orders, updateTime);

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

function updateStats(orders, updateTime = true) {
  const totalOrdersElement = document.getElementById("totalOrders");

  if (totalOrdersElement) {
    totalOrdersElement.innerText = orders.length;
  }

  document.getElementById("preparingOrders").innerText =
    orders.filter(o => o.status === "Preparing").length;

  document.getElementById("readyOrders").innerText =
    orders.filter(o => o.status === "Ready").length;

  document.getElementById("deliveredOrders").innerText =
    orders.filter(o => o.status === "Delivered").length;

  document.getElementById("cancelledorders").innerText =
    orders.filter(o => o.status === "Cancelled").length;

  const today = new Date().toDateString();

  const todayOrders = orders.filter(order => {
    return new Date(order.order_time).toDateString() === today;
  });

  document.getElementById("todayOrders").innerText = todayOrders.length;

  const deliveredOrders = todayOrders.filter(order => order.status === "Delivered");

  const revenue = deliveredOrders.reduce((sum, order) => {
    return sum + Number(order.total_amount || 0);
  }, 0);

  document.getElementById("todayRevenue").innerText = "₹" + revenue;

  if (updateTime) {
  document.getElementById("lastUpdated").innerText =
    "Last Updated: " + new Date().toLocaleTimeString();
}
}

function filterByStatus(status) {
  if (status === "All") {
    renderOrders(allOrders);
    return;
  }

  const filtered = allOrders.filter(order => order.status === status);
  renderOrders(filtered);
}

function exportOrders() {
  let csv = "Token,Student,Email,Food,Qty,Total,Payment,Pickup Time,Counter,Status\n";

  allOrders.forEach(order => {
    csv += `"${getToken(order)}","${getStudentName(order)}","${getStudentEmail(order)}","${getFoodName(order)}","${getQuantity(order)}","${getTotal(order)}","${getPayment(order)}","${getPickupTime(order)}","${getCounter(order)}","${order.status}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "unieats-orders.csv";
  a.click();

  window.URL.revokeObjectURL(url);
}

async function updateStatus(id, status) {
  let bodyData = { status: status };

  if (status === "Delivered") {

  let deliveryPerson = prompt("Enter delivery person name:");

  if (!deliveryPerson || deliveryPerson.trim() === "") {
    alert("Delivery person name is required.");
    return;
  }

  deliveryPerson = deliveryPerson.trim();

  // Only alphabets and spaces allowed
  if (!/^[A-Za-z\s]+$/.test(deliveryPerson)) {
    alert("Delivery person name must contain alphabets only.");
    return;
  }

  let deliveryPersonId = prompt("Enter delivery person ID:");

  if (!deliveryPersonId || deliveryPersonId.trim() === "") {
    alert("Delivery person ID is required.");
    return;
  }

  deliveryPersonId = deliveryPersonId.trim();

  // Only digits allowed
  if (!/^[0-9]+$/.test(deliveryPersonId)) {
    alert("Delivery person ID must contain digits only.");
    return;
  }

  bodyData.deliveryPerson = deliveryPerson;
  bodyData.deliveryPersonId = deliveryPersonId;
}

  if (status === "Cancelled") {
    let commonReasons =
      "Choose cancellation reason:\n\n" +
      "1. Food item not available\n" +
      "2. Ingredients not available\n" +
      "3. Canteen is closing soon\n" +
      "4. Payment issue\n" +
      "5. Student did not collect on time\n" +
      "6. Duplicate order\n" +
      "7. Other reason\n\n" +
      "Enter number from 1 to 7:";

    let choice = prompt(commonReasons);

    let reasons = {
      "1": "Food item not available",
      "2": "Ingredients not available",
      "3": "Canteen is closing soon",
      "4": "Payment issue",
      "5": "Student did not collect on time",
      "6": "Duplicate order"
    };

    let cancelReason = "";

    if (choice === "7") {
      cancelReason = prompt("Enter custom cancellation reason:");
    } else {
      cancelReason = reasons[choice];
    }

    if (!cancelReason || cancelReason.trim() === "") {
      alert("Cancellation reason is required.");
      return;
    }

    bodyData.cancelReason = cancelReason.trim();
  }

  try {
    const response = await fetch(
      `https://student-portal-backend-uo7y.onrender.com/api/owner/orders/${id}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyData)
      }
    );

    const result = await response.json();

if (!result.success) {
  alert(
    (result.message || "Status update failed") +
    "\n\nBackend Error: " +
    (result.error || "No exact error received")
  );

  console.log("FULL BACKEND RESULT:", result);
  return;
}

alert("Order status updated successfully.");
loadOrders();

} catch (error) {
  alert("Backend error. Status not updated.");
  console.error(error);
}
}

loadOrders();

let autoRefresh = setInterval(() => {
  loadOrders(false);
}, 5000);

