const img = document.createElement('img');
img.src = 'https://example.com/image.jpg';
img.alt = 'Description';
document.body.appendChild(img); // or append to any container


document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('venueForm');
    const resultsDiv = document.getElementById('results');
    autoLoadVenues();
});

//implementing how to get venues based on what's nearby!!!

function autoLoadVenues() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetchNearbyVenues(latitude, longitude);
            },
            error => {
                console.log('Location access denied or failed:', error);
                // Optionally show a message or use default location
                // fallbackToDefaultLocation();
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // Cache location for 5 minutes
            }
        );
    } else {
        console.log('Geolocation not supported');
    }
}


async function fetchNearbyVenues(lat, lon, options = {}) {
    const {
        radius = 2000,        // 2km default
        limit = 15,           // More venues
        types = "BAR,CAFE,RESTAURANT,BREWERY",
        loadingContainer = "venue-container"
    } = options;

    const container = document.getElementById(loadingContainer);
    if (container) {
        container.innerHTML = "<p>Finding nearby venues...</p>";
    }

    try {
        const response = await fetch("http://localhost:3000/api/bars", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                lat, 
                lon,
                radius,
                limit,
                types
            }),
        });

        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        if (data.venues && data.venues.length > 0) {
            console.log(`Found ${data.venues.length} venues`); // Debug log
            displayVenues(data.venues);
            // Cache the results
           // cacheVenueData(lat, lon, data.venues);
        } else {
            console.log('No venues found in response'); // Debug log
            showNoVenuesMessage();
        }
    } catch (error) {
        console.error('Error fetching venues:', error);
        showErrorMessage();
    }
}






// Function to display venues in the UI
function displayVenues(venues) {
    const container = document.getElementById("venue-container");
    
    if (!container) {
        console.error('venue-container not found');
        return;
    }
    
    container.innerHTML = `<h2>Found ${venues.length} venues near you:</h2>`;
    
    venues.forEach(venue => {
        const venueDiv = document.createElement('div');
        venueDiv.className = 'venue_display';
        
        venueDiv.innerHTML = `
            <div class="row">
                <div class="venueName">
                    <h3>${venue.venue_name || 'Unknown Venue'}</h3>
                </div>
                <div class="ratings">
                    <p> Rating: ${venue.rating || 'N/A'}</p>
                </div>
            </div>
            
            <div class="stack">
                ${venue.venue_photo ? `<img class="venue_image" src="${venue.venue_photo}" alt="${venue.venue_name}">` : ''}
                
                <div class="address_venue">
                    <p>${venue.venue_address || 'Address not available'}</p>
                    <p>${venue.venue_types ? venue.venue_types.join(', ') : ''}</p>
                </div>
                
                <div class="venue_busy">
                    <p>Current status: ${venue.day_info?.[0]?.venue_open <= new Date().getHours() ? 'Open' : 'Closed'}</p>
                    ${venue.day_info?.[0]?.busy_hours ? `<p>Busy hours: ${venue.day_info[0].busy_hours.join(', ')}</p>` : ''}
                </div>
            </div>
        `;
        
        container.appendChild(venueDiv);
    });
}

// Function to show when no venues are found
function showNoVenuesMessage() {
    const container = document.getElementById("venue-container");
    if (container) {
        container.innerHTML = `
            <div class="venue_display">
                <h3>😔 No venues found nearby</h3>
                <p>Try expanding your search radius or check your location settings.</p>
            </div>
        `;
    }
}

// Function to show error message
function showErrorMessage() {
    const container = document.getElementById("venue-container");
    if (container) {
        container.innerHTML = `
            <div class="venue_display">
                <h3>❌ Error loading venues</h3>
                <p>Please check your internet connection and try again.</p>
            </div>
        `;
    }
}