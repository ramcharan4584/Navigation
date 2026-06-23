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

  document.getElementById("fixedCheckoutBar").style.display = "none";

  document.getElementById("orderTitle").innerText = "Checkout Details";
  document.getElementById("orderItem").innerText = food.foodName;

  document.getElementById("checkoutItemsStep").style.display = "none";
  document.getElementById("proceedCheckoutBtn").style.display = "none";
  document.getElementById("paymentStep").style.display = "block";

  document.getElementById("singleOrderBox").style.display = "block";

  document.getElementById("quantity").value = 1;
  document.getElementById("totalAmount").innerText = food.price;
  document.body.classList.add("popup-open");
  document.getElementById("orderPopup").style.display = "flex";
  document.getElementById("tokenBox").style.display = "none";
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
  updateFixedCheckoutBar();
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

  document.getElementById("tokenBox").style.display = "none";

  document.getElementById("fixedCheckoutBar").style.display = "none";

  document.getElementById("orderTitle").innerText =
    "Review Your Cart";

  document.getElementById("orderItem").innerText = "";

  document.getElementById("singleOrderBox").style.display =
    "none";

  document.getElementById("checkoutItemsStep").style.display =
    "block";

  document.getElementById("proceedCheckoutBtn").style.display =
    "block";

  document.getElementById("paymentStep").style.display =
    "none";

  displayCheckoutItemsStep();

  document.body.classList.add("popup-open");

  document.getElementById("orderPopup").style.display =
    "flex";
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

  let payment =
    document.getElementById("paymentMethod").value;

  let paymentDetails =
    document.getElementById("paymentDetails");

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

    paymentDetails.style.display = "none";
    paymentDetails.innerHTML = "";
  }
}

function closeOrder() {
  document.getElementById("orderPopup").style.display = "none";
  document.body.classList.remove("popup-open");
  updateFixedCheckoutBar();
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

  let ownerNote = document.getElementById("ownerNote").value.trim();

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
      ownerNote: ownerNote
    };

    tokenHTML = `
      <div class="token-items">
        <strong>Items:</strong><br>
        ${selectedItem} × ${quantity}
      </div>

      <div class="token-summary">
        <strong>Total Quantity:</strong> ${quantity}<br>
        <strong>Total:</strong> ₹${total}<br>
        <strong>Token No:</strong> ${tokenNumber}<br>
        <strong>Pickup Time:</strong> ${pickupTime}<br>
        <strong>Payment:</strong> ${payment}<br>
        <strong>Status:</strong> Preparing<br>
        <strong>Counter:</strong> ${receiverPlace}
      </div>
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
      ownerNote: ownerNote
    };

    tokenHTML = `
      <div class="token-items">
        <strong>Items:</strong><br>
        ${itemList}
      </div>

      <div class="token-summary">
        <strong>Total Quantity:</strong> ${totalQuantity}<br>
        <strong>Total:</strong> ₹${total}<br>
        <strong>Token No:</strong> ${tokenNumber}<br>
        <strong>Pickup Time:</strong> ${pickupTime}<br>
        <strong>Payment:</strong> ${payment}<br>
        <strong>Status:</strong> Preparing<br>
        <strong>Counter:</strong> ${receiverPlace}
      </div>
    `;
  }

  console.log("Sending order through Razorpay:", orderData);

  await payAndPlaceOrder(orderData, tokenHTML);
}

function closeToken() {
  document.getElementById("tokenBox").style.display = "none";
  document.body.classList.remove("popup-open");
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

function updateFixedCheckoutBar() {
  let fixedBar = document.getElementById("fixedCheckoutBar");
  let itemCount = document.getElementById("checkoutItemCount");

  let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  let totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let orderPopup = document.getElementById("orderPopup");

  if (orderPopup.style.display === "flex") {
    fixedBar.style.display = "none";
    return;
  }

  if (cart.length > 0) {
    fixedBar.style.display = "flex";
    itemCount.innerText = `${totalItems} item${totalItems > 1 ? "s" : ""} added`;
    totalAmount.innerText = `Total ₹${totalPrice}`;
  } else {
    fixedBar.style.display = "none";
  }
}

function displayCheckoutItemsStep() {
  let checkoutItemsStep = document.getElementById("checkoutItemsStep");

  checkoutItemsStep.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    checkoutItemsStep.innerHTML += `
      <div class="checkout-cart-item">
        <div>
          <strong>${item.foodName}</strong>
          <p>₹${item.price} × ${item.quantity}</p>
        </div>

        <div>
          <button onclick="decreaseCheckoutQty(${index})">-</button>
          <span>${item.quantity}</span>
          <button onclick="increaseCheckoutQty(${index})">+</button>
          <button onclick="removeCheckoutItem(${index})">Remove</button>
        </div>
      </div>
    `;
  });

  checkoutItemsStep.innerHTML += `
    <div class="checkout-step-total">
      <strong>Total: ₹${total}</strong>
    </div>
  `;
}

function increaseCheckoutQty(index) {
  cart[index].quantity++;
  displayCart();
  displayCheckoutItemsStep();
}

function decreaseCheckoutQty(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
  } else {
    cart.splice(index, 1);
  }

  if (cart.length === 0) {
    closeOrder();
    return;
  }

  displayCart();
  displayCheckoutItemsStep();
}

function removeCheckoutItem(index) {
  cart.splice(index, 1);

  if (cart.length === 0) {
    closeOrder();
    return;
  }

  displayCart();
  displayCheckoutItemsStep();
}

function proceedToPayment() {
  let total = cart.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  document.getElementById("orderTitle").innerText = "Checkout Details";
  document.getElementById("checkoutItemsStep").style.display = "none";
  document.getElementById("proceedCheckoutBtn").style.display = "none";
  document.getElementById("paymentStep").style.display = "block";
  document.getElementById("totalAmount").innerText = total;
}

function selectPayment(method) {
  document.getElementById("paymentMethod").value = method;
  showPaymentDetails();
}

function toggleFavorite(button, name, desc, price, image) {

  let favorites =
    JSON.parse(localStorage.getItem("favoriteFoods")) || [];

  const exists = favorites.find(food => food.name === name);

  if (exists) {

    favorites =
      favorites.filter(food => food.name !== name);

    button.classList.remove("active");

    button.innerHTML =
      `<i class="fa-regular fa-heart"></i>`;

  } else {

    favorites.push({
      name,
      desc,
      price,
      image
    });

    button.classList.add("active");

    button.innerHTML =
      `<i class="fa-solid fa-heart"></i>`;
  }

  localStorage.setItem(
    "favoriteFoods",
    JSON.stringify(favorites)
  );
}

function loadFavoriteStates() {
  const favorites =
    JSON.parse(localStorage.getItem("favoriteFoods")) || [];

  document.querySelectorAll(".fav-btn").forEach(button => {
    const foodCard = button.closest(".food-card");
    const foodName = foodCard.querySelector("h3").innerText.trim();

    const exists = favorites.some(food => food.name === foodName);

    button.classList.toggle("active", exists);

    button.innerHTML = exists
      ? `<i class="fa-solid fa-heart"></i>`
      : `<i class="fa-regular fa-heart"></i>`;
  });
}

window.addEventListener("pageshow", () => {
  loadFavoriteStates();
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    loadFavoriteStates();
  }
});

async function payAndPlaceOrder(orderData, tokenHTML) {
  try {
    const orderResponse = await fetch(
      "https://student-portal-backend-uo7y.onrender.com/api/payments/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: orderData.totalAmount
        })
      }
    );

    const orderResult = await orderResponse.json();

    if (!orderResult.success) {
      alert("Unable to start payment");
      return;
    }

    const options = {
      key: orderResult.key,
      amount: orderResult.order.amount,
      currency: "INR",
      name: "UniEats",
      description: "Campus Food Order",
      order_id: orderResult.order.id,

      handler: async function (paymentResponse) {
        const verifyResponse = await fetch(
          "https://student-portal-backend-uo7y.onrender.com/api/payments/verify",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(paymentResponse)
          }
        );

        const verifyResult = await verifyResponse.json();

        if (!verifyResult.success) {
          alert("Payment verification failed");
          return;
        }

        await placeOrderAfterPayment(orderData, tokenHTML);
      },

      prefill: {
        name: orderData.studentName,
        email: orderData.studentEmail,
        contact: localStorage.getItem("studentPhone") || ""
      },

      notes: {
        tokenNo: orderData.tokenNo,
        pickupTime: orderData.pickupTime,
        counter: orderData.counter
      },

      theme: {
        color: "#2563eb"
      }
    };

    const razorpayPopup = new Razorpay(options);

    razorpayPopup.on("payment.failed", function (response) {
      console.error("Razorpay payment failed:", response.error);
      alert(response.error.description || "Payment failed");
    });

    razorpayPopup.open();

  } catch (error) {
    console.error(error);
    alert("Payment failed to start");
  }
}

async function placeOrderAfterPayment(orderData, tokenHTML) {
  const response = await fetch(
    "https://student-portal-backend-uo7y.onrender.com/api/orders",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    }
  );

  const data = await response.json();

  if (data.success) {
    document.getElementById("tokenDetails").innerHTML = tokenHTML;
    document.getElementById("orderPopup").style.display = "none";
    document.body.classList.remove("popup-open");
    document.getElementById("tokenBox").style.display = "block";

    if (orderMode === "cart") {
      cart = [];
      displayCart();
    }
  } else {
    alert("Order failed after payment");
  }
}

async function sendPaymentReceipt(orderData) {
  try {
    await fetch(
      "https://student-portal-backend-uo7y.onrender.com/api/whatsapp/payment-receipt",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: orderData.studentEmail,
          amount: orderData.totalAmount,
          tokenNo: orderData.tokenNo,
          paymentMethod: "Razorpay",
          purpose: "UniEats Food Order"
        })
      }
    );
  } catch (error) {
    console.error("Payment receipt WhatsApp failed:", error);
  }
}