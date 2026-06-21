async function loadMostOrderedFoods() {
  const board = document.getElementById("mostOrderedBoard");

  try {
    const response = await fetch(
      "https://student-portal-backend-uo7y.onrender.com/api/most-ordered-foods"
    );

    const foods = await response.json();

    if (!foods.length) {
      board.innerHTML = `
        <tr>
          <td colspan="4">No order data available yet.</td>
        </tr>
      `;
      return;
    }

    board.innerHTML = foods.map((food, index) => `
      <tr>
        <td>
          <span class="rank-badge">${index + 1}</span>
        </td>

        <td>
          <strong>${food.food_name}</strong>
        </td>
        <td>
          <span class="trend-badge">
            ${index < 3 ? "Most Loved" : "Favorite"}
          </span>
        </td>
      </tr>
    `).join("");

  } catch (error) {
    console.error("Most ordered error:", error);

    board.innerHTML = `
      <tr>
        <td colspan="4">Unable to load most ordered foods.</td>
      </tr>
    `;
  }
}

function goBack() {
  window.history.back();
}

loadMostOrderedFoods();