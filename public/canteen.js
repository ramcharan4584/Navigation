// canteen.js

let selectedItem = "";
let selectedPrice = 0;

function openOrder(itemName, price) {
  selectedItem = itemName;
  selectedPrice = price;

  document.getElementById("orderItem").innerText = itemName;
  document.getElementById("quantity").value = 1;
  document.getElementById("totalAmount").innerText = price;

  document.getElementById("orderPopup").style.display = "flex";
}

function closeOrder() {
  document.getElementById("orderPopup").style.display = "none";
}

function updateTotal() {
  let quantity = document.getElementById("quantity").value;
  let total = selectedPrice * quantity;

  document.getElementById("totalAmount").innerText = total;
}

async function confirmOrder() {
  let quantity = document.getElementById("quantity").value;
  let total = selectedPrice * quantity;
  let payment = document.getElementById("paymentMethod").value;
  let tokenNumber = "SNIST-" + Math.floor(100 + Math.random() * 900);

  const orderData = {
    studentName: localStorage.getItem("studentName") || "Student",
    studentEmail: localStorage.getItem("studentEmail") || "student@email.com",
    foodName: selectedItem,
    quantity: Number(quantity),
    totalAmount: Number(total),
    paymentMethod: payment,
    tokenNo: tokenNumber,
    status: "Preparing",
    counter: "Main Cafeteria"
  };

  console.log("Sending order to backend...", orderData);

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

  document.getElementById("tokenDetails").innerHTML = `
    <strong>Food:</strong> ${selectedItem}<br>
    <strong>Quantity:</strong> ${quantity}<br>
    <strong>Total Paid:</strong> ₹${total}<br>
    <strong>Payment:</strong> ${payment}<br>
    <strong>Token No:</strong> ${tokenNumber}<br>
    <strong>Status:</strong> Preparing<br>
    <strong>Counter:</strong> Main Cafeteria
  `;
}

function closeToken() {
  document.getElementById("tokenBox").style.display = "none";
}

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