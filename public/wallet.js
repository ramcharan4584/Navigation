let walletBalance = Number(localStorage.getItem("walletBalance")) || 0;
let transactions = JSON.parse(localStorage.getItem("walletTransactions")) || [];
let selectedAmount = 0;

function updateWalletUI() {
  document.getElementById("walletBalance").innerText = `₹${walletBalance}`;

  const list = document.getElementById("transactionsList");

  if (transactions.length === 0) {
    list.innerHTML = `<p style="color:#5C6B8A;">No transactions yet.</p>`;
    return;
  }

  list.innerHTML = transactions.map(txn => `
    <div class="transaction">
      <span>${txn.title}</span>
      <span class="${txn.type}">
        ${txn.type === "credit" ? "+" : "-"} ₹${txn.amount}
      </span>
    </div>
  `).join("");
}

function openUpiPopup(amount) {
  selectedAmount = amount;
  document.getElementById("upiAmountText").innerText = `₹${amount}`;
  document.getElementById("upiPopup").classList.add("active");
}

function openCustomUpiPopup() {
  const amount = Number(document.getElementById("customAmount").value);

  if (!amount || amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  openUpiPopup(amount);
}

function closeUpiPopup() {
  document.getElementById("upiPopup").classList.remove("active");
}

function payWithUpi(app) {
  const upiId = "canteen@upi";
  const name = "UniEats Wallet";
  const note = "Wallet Recharge";

  const upiUrl =
    `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${selectedAmount}&cu=INR&tn=${encodeURIComponent(note)}`;

  window.location.href = upiUrl;

  setTimeout(() => {
    const confirmPayment = confirm("Did you complete the UPI payment?");

    if (confirmPayment) {
      walletBalance += selectedAmount;

      transactions.unshift({
        title: `Wallet Recharge via ${app.toUpperCase()}`,
        amount: selectedAmount,
        type: "credit"
      });

      localStorage.setItem("walletBalance", walletBalance);
      localStorage.setItem("walletTransactions", JSON.stringify(transactions));

      closeUpiPopup();
      updateWalletUI();
    }
  }, 2500);
}

updateWalletUI();