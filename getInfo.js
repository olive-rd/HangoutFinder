
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
  console.log("getPopularBars called with:", lat, lon);
  const container = document.getElementById("venue-container");
  if (!container) {
    console.error("Container element 'venue-container' not found");
    return;
  }
  console.log("Container found, setting loading message");
  container.innerHTML = "<p>Loading nearby bars...</p>";

  try {
    // BestTime bars
    console.log("Fetching from BestTime API...");
    const res = await fetch("http://localhost:3000/api/bars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon }),
    });
    
    if (!res.ok) {
      throw new Error(`BestTime API failed: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log("BestTime API response:", data);

    // Google Places details
    console.log("Fetching from Google Places API...");
    const googleRes = await fetch("http://localhost:3000/api/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon }),
    });
    
    if (!googleRes.ok) {
      throw new Error(`Google Places API failed: ${googleRes.status} ${googleRes.statusText}`);
    }
    
    const googleData = await googleRes.json();
    console.log("Google Places API response:", googleData);
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



  const venueDiv = document.createElement('div');
        venueDiv.className = 'venue_display';
        
        venueDiv.innerHTML = `
  
<section  class="card panel stack venue_display" id="web-only">
       
       <div class="row">
        <div id="venueName">
    <h2>${v.venue_name || 'Unknown Venue'}</h2>

</div>
      

<div id="ratings">
<h2>Rating: ${g.rating || "N/A"}</h2>



    </div>

     </div>



<div class="stack">
            


 <div id="address_dis" class="stack">
      <h3>
    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      g.name || v.venue_name
    )}" target="_blank" rel="noopener noreferrer">
      ${g.name || v.venue_name}
    </a>
  </h3>
</div>

<div class="venue_img" class="stack">
             ${photoUrl ? `<img src="${photoUrl}" alt="${g.name}" />` : ""}


</div><!--end of stack class-->

<div id="curr_pop" class="stack">
            <h3>Current Population${
    popularity === "N/A" ? "N/A" : popularity + "%"
  }</h3>

</div>

 <div id="venue_desc" class="stack">
            <h3>${g.editorial_summary?.overview || "No description available."}</h3>

</div>





        </div>
</section>
`;











  container.appendChild(venueDiv);
});
  } catch (err) {
    console.error("Error fetching bars:", err);
    console.error("Error details:", err.message);
    console.error("Stack trace:", err.stack);
    container.innerHTML = `<p>Failed to load bars 😞</p><p>Error: ${err.message}</p>`;
  }
}


// Handle "Find Bars" button click event

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, setting up GenerateVenues function");
    
    // Override the GenerateVenues function to use our getPopularBars
    window.GenerateVenues = function(category, sorting) {
        console.log("GenerateVenues called with category:", category, "sorting:", sorting);
        
        if (navigator.geolocation) {
            console.log("Getting user location...");
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    console.log("Location obtained:", latitude, longitude);
                    getPopularBars(latitude, longitude);
                },
                (err) => {
                    console.error("Geolocation error:", err);
                    alert("Unable to get your location: " + err.message);
                }
            );
        } else {
            console.error("Geolocation not supported");
            alert("Geolocation not supported by your browser");
        }
    };
    
    console.log("GenerateVenues function set up successfully");
});
