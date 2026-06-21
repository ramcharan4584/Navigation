function loadFavorites() {

  const container =
    document.getElementById("favoritesContainer");

  const favorites =
    JSON.parse(localStorage.getItem("favoriteFoods")) || [];

  if (favorites.length === 0) {

    container.innerHTML = `
      <div class="empty-favorites">
        <i class="fa-regular fa-heart"></i>
        <h3>No Favorites Yet</h3>
        <p>Save your favorite food items here.</p>
      </div>
    `;

    return;
  }

  container.innerHTML = favorites.map(food => `
    <div class="favorite-card">

      <img src="${food.image}">

      <div class="favorite-info">
        <h3>${food.name}</h3>
        <p>${food.desc}</p>

        <div class="favorite-bottom">
          <span>${food.price}</span>

          <button onclick="removeFavorite('${food.name}')">
            Remove
          </button>
        </div>
      </div>

    </div>
  `).join("");
}

function removeFavorite(name) {
  let favorites =
    JSON.parse(localStorage.getItem("favoriteFoods")) || [];

  favorites = favorites.filter(food => food.name !== name);

  localStorage.setItem("favoriteFoods", JSON.stringify(favorites));

  window.dispatchEvent(new Event("favoritesUpdated"));

  loadFavorites();
}
loadFavorites();