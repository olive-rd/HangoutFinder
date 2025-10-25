document.getElementById("loadBars").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      getPopularBars(latitude, longitude);
    }, err => {
      alert("Unable to get your location: " + err.message);
    });
  } else {
    alert("Geolocation not supported by your browser");
  }
});

async function getPopularBars(lat, lon) {
  const container = document.getElementById("barContainer");
  container.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch("http://localhost:3000/api/bars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon }),
    });

    const data = await res.json();

    container.innerHTML = "";

    if (!data.venues || data.venues.length === 0) {
      container.innerHTML = "<p>No bars found nearby 😢</p>";
      return;
    }

    data.venues.forEach(bar => {
      const card = document.createElement("div");
      card.className = "bar-card";
      card.innerHTML = `
        <h2>${bar.venue_name}</h2>
        <p>${bar.venue_address}</p>
        <p>Current Popularity: <span class="popularity">${bar.analysis?.now ?? "N/A"}%</span></p>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error fetching bars:", err);
    container.innerHTML = "<p>Failed to fetch bar data.</p>";
  }
}
