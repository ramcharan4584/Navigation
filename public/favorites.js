async function loadFavoriteFoods() {
  const board = document.getElementById("favoritesBoard");

  try {
    const response = await fetch(
      "https://student-portal-backend-uo7y.onrender.com/api/favorite-foods"
    );

    const foods = await response.json();

    if (!foods.length) {
      board.innerHTML = `
        <p class="empty-text">No favorite food data available yet.</p>
      `;
      return;
    }

    board.innerHTML = foods.map((food, index) => `
      <div class="favorite-card">
        <div class="rank">${getRankEmoji(index)}</div>
        <h3>${food.food_name}</h3>
        <p>This item is one of the most ordered foods on UniEats.</p>
        <span class="order-count">${food.total_orders} Orders</span>
      </div>
    `).join("");

  } catch (error) {
    console.error("Favorites loading error:", error);

    board.innerHTML = `
      <p class="empty-text">Unable to load favorite foods.</p>
    `;
  }
}

function getRankEmoji(index) {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return "⭐";
}

loadFavoriteFoods();