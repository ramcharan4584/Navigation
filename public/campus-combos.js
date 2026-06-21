const comboButtons = document.querySelectorAll(".combo-bottom button");

comboButtons.forEach(button => {
  button.addEventListener("click", () => {
    alert("Combo added successfully!");
  });
});