async function loadMyOrders() {
  const email = localStorage.getItem("studentEmail");
  const ordersList = document.getElementById("ordersList");

  if (!email) {
    ordersList.innerHTML = "<p>Please login again.</p>";
    return;
  }

  const response = await fetch(
    `https://student-portal-backend-uo7y.onrender.com/api/orders/${email}`
  );

  const orders = await response.json();

  if (!Array.isArray(orders) || orders.length === 0) {
    ordersList.innerHTML = "<p>No orders found.</p>";
    return;
  }

  ordersList.innerHTML = orders.map(order => `
    <div class="order-card">

      <img
        class="order-img"
        src="${getOrderImage(order.food_name)}"
        alt="${order.food_name}"
      >

      <div class="order-details">

        <div class="order-head">
          <h3>${order.food_name}</h3>
          <strong>₹${order.total_amount}</strong>
        </div>

        <p><b>Qty:</b> ${order.quantity}</p>
        <p><b>Token:</b> ${order.token_no}</p>
        <p>
          <b>Status:</b>
          <span class="status ${order.status}">
            ${order.status}
          </span>
        </p>

        ${
          order.status === "Cancelled" && order.cancel_reason
            ? `
              <p class="cancel-reason">
                <b>Reason:</b> ${order.cancel_reason}
              </p>
            `
            : ""
        }
        <p><b>Pickup time:</b> ${order.pickup_time}</p>
        <p><b>Counter:</b> ${order.counter_name}</p>
        <p><b>Ordered on:</b> ${new Date(order.order_time).toLocaleString()}</p>

      </div>

    </div>
  `).join("");
}

function getOrderImage(foodName = "") {
  let name = foodName.toLowerCase();

  if (name.includes("dosa")) return "images/dosa.jpg";
  if (name.includes("biryani")) return "images/biryani.jpg";
  if (name.includes("samosa")) return "images/samosa.jpg";

  return "images/food-default.jpg";
}

function goBack() {
  window.history.back();
}

loadMyOrders();