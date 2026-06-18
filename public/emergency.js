document.addEventListener("DOMContentLoaded", function () {
  const emergencyBtn = document.querySelector(".emergency-btn");
  const emergencyBox = document.getElementById("emergencyBox");
  const closeBtn = document.getElementById("closeEmergencyBtn");

  if (!emergencyBtn || !emergencyBox) return;

  emergencyBtn.addEventListener("click", function (event) {
    event.stopPropagation();
    emergencyBox.classList.toggle("active");
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      emergencyBox.classList.remove("active");
    });
  }

  document.addEventListener("click", function (event) {
    if (
      emergencyBox.classList.contains("active") &&
      !emergencyBox.contains(event.target) &&
      !emergencyBtn.contains(event.target)
    ) {
      emergencyBox.classList.remove("active");
    }
  });
});