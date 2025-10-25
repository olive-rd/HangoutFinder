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
      console.log(JSON.stringify(bar, null, 2))
      const currentPopularity = getBestAvailablePopularity(bar);


      const card = document.createElement("div");
      card.className = "bar-card";
      card.innerHTML = `
        <h2>${bar.venue_name}</h2>
        <p>${bar.venue_address}</p>
        <p>Current Popularity: <span class="popularity">${currentPopularity}% </span></p>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error fetching bars:", err);
    container.innerHTML = "<p>Failed to fetch bar data.</p>";
  }
}





function getBestAvailablePopularity(bar) {
  // 1️⃣ Try live popularity if available
  if (bar.analysis && typeof bar.analysis.now === "number") {
    return bar.analysis.now;
  }

  // 2️⃣ Otherwise, use forecasted busyness for this hour
  if (bar.day_raw && Array.isArray(bar.day_raw)) {
    const currentHour = new Date().getHours();
    const forecast = bar.day_raw[currentHour];
    if (typeof forecast === "number") return forecast;
  }

  // 3️⃣ Fallback if no data
  return "N/A";
}