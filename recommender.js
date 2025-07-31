// Function to generate access token
async function generateAccessToken() {
    const apiKey = "MqhGpQfAAtrSO5wAd1DuZCAIdbkAWTlL";
    const apiSecret = "UGXcK3CfvRzcqJ6m";

    try {
        const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${apiSecret}`
        }); // HTTP POST request for access token

        const data = await response.json();
        console.log(data.access_token);
        return data.access_token; // Return value of access token
    } catch (error) {
        console.error("Error fetching access token:", error);
    } // Handle any errors that occur
}

// Takes access token and uses it to call the API
async function callAPI(latitude, longitude, radius) { // Function to call the API with latitude, longitude, and radius
    const token = await generateAccessToken(); // Takes access token from the function above

    if (!token) {
        console.log("No access token available");
        return; // If no access token is available, exit the function
    }

    const endpoint = `/shopping/activities?latitude=${latitude}&longitude=${longitude}&radius=${radius}`; // Endpoint for the API call with latitude, longitude, and radius

    try {
        const response = await fetch(`https://test.api.amadeus.com/v1${endpoint}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            } // HTTP GET request to the API with the access token
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        } // Check if the response is OK, if not throw an error

        const data = await response.json(); // Parse the JSON response from the API
        console.log(data);
        if (data && data.data) {
            displayActivities(data.data); // If data is available, display the activities
        } else {
            displayActivities([]); // If no data is available, display an empty list
        }
        return data;
    } catch (error) {
        console.error("Error calling API:", error);
        displayActivities([]);
    }
}


// Updates the displayed value on the radius slider
document.getElementById("radius").addEventListener("input", function () {
  document.getElementById("radius-value").textContent = this.value;
});

const cityProfiles = { // Object containing city profiles with budget, weather, and activity preferences
  "Madrid":   { budget: "low",    weather: "mild",  activity: "museum" },
  "Berlin":   { budget: "medium", weather: "cold",  activity: "museum" },
  "London":   { budget: "high",   weather: "mild",  activity: "culinary" },
  "New York": { budget: "medium", weather: "cold",  activity: "culinary" },
  "Paris":    { budget: "high",   weather: "mild",  activity: "museum" },
  "Rome":     { budget: "medium", weather: "warm",  activity: "culinary" }
};

const cityCoordinates = { // Object containing city coordinates with latitude and longitude
  "Madrid":   { latitude: 40.4168, longitude: -3.7038 },
  "Berlin":   { latitude: 52.52,   longitude: 13.4050 },
  "London":   { latitude: 51.5074, longitude: -0.1278 },
  "New York": { latitude: 40.7128, longitude: -74.0060 },
  "Paris":    { latitude: 48.8566, longitude: 2.3522 },
  "Rome":     { latitude: 41.9028, longitude: 12.4964 }
};

function displayActivities(activities) { // Function to display activities in the activity section
    const activityList = document.getElementById("activity-list"); // Get the activity list element
    activityList.innerHTML = ""; // Clear the existing list on each call

    // Limit to first 10 activities and show name + description only
    activities.slice(0, 10).forEach(activity => {
        const li = document.createElement("li"); // Create a new list item for each activity
        li.textContent = activity.name; // Set content of list item to the activity name
        if (activity.description) { // If a description exists, append it to the list item
            li.textContent += `: ${activity.description}`;
        }
        activityList.appendChild(li); // Append the list item to the activity list
    });
}

function getBestMatch(preferences) { // Function to get the best city match based on user preferences
  let bestCity = null; // Variable to store the best city match; initially set to null
  let highestScore = -1; // Variable to store the highest score; initially set to -1

  for (const [city, profile] of Object.entries(cityProfiles)) { // Iterate over each city and its profile in the cityProfiles object
    let score = 0; // Each city's score starts at 0

    if (preferences.budget && preferences.budget === profile.budget) score++; // Increment score by 1 if budget matches
    if (preferences.weather && preferences.weather === profile.weather) score++;
    if (preferences.activity && preferences.activity === profile.activity) score++;

    if (score > highestScore) {
      highestScore = score; // Update highest score if current city's score is higher
      bestCity = city; // Update best city if current city has the highest score
    }
  }

  return bestCity || "New York"; // Return the best city match; default to New York if no match is found
}


document.getElementById("preference-quiz").addEventListener("submit", async function (e) { // Event listener for the preference quiz form submission
  e.preventDefault(); // Prevent form from refreshing the page on submission

  const preferences = { // Takes user preferences from the form inputs
    budget: document.getElementById("budget").value || null,
    weather: document.getElementById("weather").value || null,
    activity: document.getElementById("activity").value || null,
    radius: parseInt(document.getElementById("radius").value) || 10
  };

  const recommended = getBestMatch(preferences); // Calls the getBestMatch function
  document.getElementById("recommended-city").innerText = `Recommended City: ${recommended}`; // Displays recommended city in HTML

  const { latitude, longitude } = cityCoordinates[recommended]; // Gets latitude and longitude of the recommended city
  await callAPI(latitude, longitude, preferences.radius); // Calls API with the city's coordinates and user-defined radius

});



