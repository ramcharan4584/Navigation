let selectedItem = "";
let selectedPrice = 0;
let orderMode = "";
let cart = [];

function getFoodDetails(button) {
  let card = button.closest(".food-card");
  let foodName = card.querySelector("h3").innerText;
  let priceText = card.querySelector(".food-bottom span").innerText;
  let price = Number(priceText.replace("₹", "").trim());

  return { foodName, price };
}

/* SINGLE PRE ORDER */

function openOrder(button) {
  let food = getFoodDetails(button);

  orderMode = "single";
  selectedItem = food.foodName;
  selectedPrice = food.price;

  document.getElementById("orderTitle").innerText = "Pre Order";
  document.getElementById("orderItem").innerText = food.foodName;
  document.getElementById("singleOrderBox").style.display = "block";

  document.getElementById("quantity").value = 1;
  document.getElementById("totalAmount").innerText = food.price;

  document.getElementById("orderPopup").style.display = "flex";
}

/* ADD TO CART */

function addToCart(button) {
  let food = getFoodDetails(button);

  let existingItem = cart.find(item => item.foodName === food.foodName);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      foodName: food.foodName,
      price: food.price,
      quantity: 1
    });
  }

  displayCart();
}

function displayCart() {
  let cartItems = document.getElementById("cartItems");
  let cartTotal = document.getElementById("cartTotal");

  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    cartItems.innerHTML += `
      <div class="cart-item">
        <div>
          <strong>${item.foodName}</strong>
          <p>₹${item.price} × ${item.quantity}</p>
        </div>

        <div>
          <button onclick="decreaseCartQty(${index})">-</button>
          <span>${item.quantity}</span>
          <button onclick="increaseCartQty(${index})">+</button>
          <button onclick="removeFromCart(${index})">Remove</button>
        </div>
      </div>
    `;
  });

  cartTotal.innerText = total;
}

function increaseCartQty(index) {
  cart[index].quantity++;
  displayCart();
}

function decreaseCartQty(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
  } else {
    cart.splice(index, 1);
  }

  displayCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  displayCart();
}

/* CART CHECKOUT */

function openCheckout() {
  if (cart.length === 0) {
    alert("Please add food items to cart first");
    return;
  }

  orderMode = "cart";

  document.getElementById("orderTitle").innerText = "Cart Checkout";
  document.getElementById("orderItem").innerText = "Multiple Items";
  document.getElementById("singleOrderBox").style.display = "none";

  let total = cart.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  document.getElementById("totalAmount").innerText = total;
  document.getElementById("orderPopup").style.display = "flex";
}

/* TOTAL */

function updateTotal() {
  let quantity = Number(document.getElementById("quantity").value);

  if (quantity < 1) {
    quantity = 1;
    document.getElementById("quantity").value = 1;
  }

  let total = selectedPrice * quantity;

  document.getElementById("totalAmount").innerText = total;
}

/* PAYMENT DETAILS */

function showPaymentDetails() {

  let payment = document.getElementById("paymentMethod").value;
  let paymentDetails = document.getElementById("paymentDetails");

  if (
    payment === "Cash" ||
    payment === "Cash at Counter"
  ) {

    paymentDetails.style.display = "block";

    paymentDetails.innerHTML = `
      <strong>Note:</strong><br>
      Pay while collecting your food at Counter.
    `;

  } else {

    paymentDetails.style.display = "block";

    paymentDetails.innerHTML = `
      <strong>Payment:</strong><br>
      Please complete your online payment.
    `;
  }
}

function closeOrder() {
  document.getElementById("orderPopup").style.display = "none";
}

/* CONFIRM ORDER */

async function confirmOrder() {
  let payment = document.getElementById("paymentMethod").value;
  let pickupTime = document.getElementById("pickupTime").value;
  let receiverPlace = document.getElementById("receiverPlace").value;

  if (receiverPlace === "") {
    alert("Please choose receiver place");
    return;
  }

  if (pickupTime === "") {
    alert("Please choose pickup time");
    return;
  }

  let tokenNumber = "SNIST-" + Math.floor(100 + Math.random() * 900);
  const studentEmail = localStorage.getItem("studentEmail");
  const studentName = localStorage.getItem("studentName") || "Student";

  if (!studentEmail) {
    alert("Student email not found. Please login again.");
    return;
  }
  let orderData;
  let tokenHTML;

  if (orderMode === "single") {
    let quantity = Number(document.getElementById("quantity").value);
    let total = selectedPrice * quantity;

    orderData = {
      studentName: studentName,
      studentEmail: studentEmail,
      foodName: selectedItem,
      quantity: quantity,
      totalAmount: total,
      tokenNo: tokenNumber,
      pickupTime: pickupTime,
      pickup_time: pickupTime,
      paymentMethod: payment,
      status: "Preparing",
      counter: receiverPlace,
    };

    tokenHTML = `
      <strong>Food:</strong> ${selectedItem}<br>
      <strong>Quantity:</strong> ${quantity}<br>
      <strong>Total:</strong> ₹${total}<br>
      <strong>Token No:</strong> ${tokenNumber}<br>
      <strong>Pickup Time:</strong> ${pickupTime}<br>
      <strong>Payment:</strong> ${payment}<br>
      <strong>Status:</strong> Preparing<br>
      <strong>Counter:</strong> ${receiverPlace}
    `;
  }

  if (orderMode === "cart") {
    let total = cart.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    let foodNames = cart.map(item => {
      return `${item.foodName} x ${item.quantity}`;
    }).join(", ");

    let totalQuantity = cart.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);

    let itemList = cart.map(item => {
      return `${item.foodName} × ${item.quantity}`;
    }).join("<br>");

    orderData = {
      studentName: studentName,
      studentEmail: studentEmail,
      foodName: foodNames,
      quantity: totalQuantity,
      items: cart,
      totalAmount: total,
      tokenNo: tokenNumber,
      pickupTime: pickupTime,
      pickup_time: pickupTime,
      paymentMethod: payment,
      status: "Preparing",
      counter: receiverPlace,
    };

    tokenHTML = `
      <strong>Items:</strong><br>${itemList}<br><br>
      <strong>Total Quantity:</strong> ${totalQuantity}<br>
      <strong>Total:</strong> ₹${total}<br>
      <strong>Token No:</strong> ${tokenNumber}<br>
      <strong>Pickup Time:</strong> ${pickupTime}<br>
      <strong>Payment:</strong> ${payment}<br>
      <strong>Status:</strong> Preparing<br>
      <strong>Counter:</strong> ${receiverPlace}
    `;
  }

  console.log("Sending order:", orderData);

  const response = await fetch("https://student-portal-backend-uo7y.onrender.com/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(orderData)
  });

  const result = await response.json();
  console.log("Backend response:", result);

  document.getElementById("orderPopup").style.display = "none";
  document.getElementById("tokenBox").style.display = "block";
  document.getElementById("tokenDetails").innerHTML = tokenHTML;

  if (orderMode === "cart") {
    cart = [];
    displayCart();
  }
}

function closeToken() {
  document.getElementById("tokenBox").style.display = "none";
}

/* FILTER */

function filterFood(category) {
  let cards = document.querySelectorAll(".food-card");

  cards.forEach(card => {
    if (category === "all" || card.dataset.category === category) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

/* SEARCH */

document.getElementById("searchFood").addEventListener("keyup", function () {
  let searchValue = this.value.toLowerCase();
  let cards = document.querySelectorAll(".food-card");

  cards.forEach(card => {
    let foodName = card.querySelector("h3").innerText.toLowerCase();

    if (foodName.includes(searchValue)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
});