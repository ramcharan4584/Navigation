let walletBalance =
  Number(localStorage.getItem("walletBalance")) || 0;

let transactions =
  JSON.parse(localStorage.getItem("walletTransactions")) || [];

let selectedAmount = 0;

function updateWalletUI() {
  document.getElementById("walletBalance").innerText =
    `₹${walletBalance}`;

  const list =
    document.getElementById("transactionsList");

  const count =
    document.getElementById("transactionCount");

  if (count) {
    count.innerText =
      `${transactions.length} ${transactions.length === 1 ? "Record" : "Records"}`;
  }

  if (transactions.length === 0) {
    list.innerHTML =
      `<p class="empty-wallet">No transactions yet.</p>`;
    return;
  }

  list.innerHTML = transactions.map(txn => `
    <div class="transaction">

      <div class="transaction-left">

        <div class="transaction-icon ${txn.type === "credit" ? "credit-bg" : "debit-bg"}">
          <i class="fa-solid ${txn.type === "credit" ? "fa-arrow-down" : "fa-arrow-up"}"></i>
        </div>

        <div class="transaction-details">
          <h4>${txn.title}</h4>
          <p>${txn.method || "Wallet"} • ${txn.dateTime || "No date available"}</p>
        </div>

      </div>

      <div class="transaction-amount ${txn.type}">
        ${txn.type === "credit" ? "+" : "-"} ₹${txn.amount}
      </div>

    </div>
  `).join("");
}

function openUpiPopup(amount) {
  selectedAmount = amount;

  document.getElementById("upiAmountText").innerText =
    `₹${amount}`;

  document.getElementById("upiPopup")
    .classList.add("active");
}

function openCustomUpiPopup() {
  const amount =
    Number(document.getElementById("customAmount").value);

  if (!amount || amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  openUpiPopup(amount);
}

function closeUpiPopup() {
  document.getElementById("upiPopup")
    .classList.remove("active");
}

function getCurrentDateTime() {
  return new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

function payWithUpi(app) {
  const upiId = "canteen@upi";
  const name = "College Portal Wallet";
  const note = "Wallet Recharge";

  const upiUrl =
    `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${selectedAmount}&cu=INR&tn=${encodeURIComponent(note)}`;

  window.location.href = upiUrl;

  setTimeout(() => {
    const confirmPayment =
      confirm("Did you complete the UPI payment?");

    if (confirmPayment) {
      walletBalance += selectedAmount;

      transactions.unshift({
        title: "Wallet Recharge",
        method: `Paid via ${formatPaymentName(app)}`,
        amount: selectedAmount,
        type: "credit",
        dateTime: getCurrentDateTime()
      });

      saveWalletData();
      closeUpiPopup();
      updateWalletUI();

      document.getElementById("customAmount").value = "";
    }
  }, 2500);
}

function debitWallet(amount, reason = "Canteen Order Payment") {
  if (walletBalance < amount) {
    alert("Insufficient wallet balance");
    return false;
  }

  walletBalance -= amount;

  transactions.unshift({
    title: reason,
    method: "Paid from College Portal Wallet",
    amount: amount,
    type: "debit",
    dateTime: getCurrentDateTime()
  });

  saveWalletData();
  updateWalletUI();

  return true;
}

function saveWalletData() {
  localStorage.setItem("walletBalance", walletBalance);

  localStorage.setItem(
    "walletTransactions",
    JSON.stringify(transactions)
  );
}

function formatPaymentName(app) {
  const names = {
    "any upi": "UPI",
    "gpay": "Google Pay",
    "phonepe": "PhonePe",
    "upi qr": "UPI QR"
  };

  return names[app] || app.toUpperCase();
}

updateWalletUI();