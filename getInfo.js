
// Get the  most available popularity

function getBestAvailablePopularity(bar) {
  if (bar.analysis && typeof bar.analysis.now === "number") return bar.analysis.now;

  if (bar.day_raw && Array.isArray(bar.day_raw)) {
    const currentHour = new Date().getHours();
    const forecast = bar.day_raw[currentHour];
    if (typeof forecast === "number") return forecast;
  }

  return "N/A";
}


// Fetch top bars nearby (BestTime & Google info)

async function getPopularBars(lat, lon) {
  const container = document.getElementById("barContainer");
  container.innerHTML = "<p>Loading nearby bars...</p>";

  try {
    // BestTime bars
    const res = await fetch("http://localhost:3000/api/bars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon }),
    });
    const data = await res.json();

    // Google Places details
    const googleRes = await fetch("http://localhost:3000/api/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon }),
    });
    const googleData = await googleRes.json();
    const googlePlaces = googleData.results || [];

    // Combination !!!!
    const combined = data.venues.map((v, i) => {
  const g = googlePlaces[i] || {};
  const popularity = getBestAvailablePopularity(v);
  return { v, g, popularity };
});

// ✅ Sort by popularity descending (highest foot traffic first)
combined.sort((a, b) => {
  const valA = typeof a.popularity === "number" ? a.popularity : -1;
  const valB = typeof b.popularity === "number" ? b.popularity : -1;
  return valB - valA;
});

// ✅ Display sorted list
container.innerHTML = "";
combined.forEach(({ v, g, popularity }) => {
  const photoUrl =
    g.photos && g.photos.length
      ? `http://localhost:3000/api/photo?ref=${g.photos[0].photo_reference}`
      : null;

  const card = document.createElement("div");
  card.className = "bar-card";
  card.innerHTML = `
  <h3>
    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      g.name || v.venue_name
    )}" target="_blank" rel="noopener noreferrer">
      ${g.name || v.venue_name}
    </a>
  </h3>
  <p>${g.formatted_address || v.venue_address || "No address available"}</p>
  ${photoUrl ? `<img src="${photoUrl}" alt="${g.name}" />` : ""}
  <p><strong>Rating:</strong> ${g.rating || "N/A"}</p>
  <p><strong>Current Popularity:</strong> ${
    popularity === "N/A" ? "N/A" : popularity + "%"
  }</p>
  <p>${g.editorial_summary?.overview || "No description available."}</p>
`;
  container.appendChild(card);
});
  } catch (err) {
    console.error("Error fetching bars:", err);
    container.innerHTML = "<p>Failed to load bars 😞</p>";
  }
}


// Handle "Find Bars" button click event

document.getElementById("loadBars").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        getPopularBars(latitude, longitude);
      },
      (err) => {
        alert("Unable to get your location: " + err.message);
      }
    );
  } else {
    alert("Geolocation not supported by your browser");
  }
});
