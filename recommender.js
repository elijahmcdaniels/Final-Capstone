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
        });

        const data = await response.json();
        console.log(data.access_token);
        return data.access_token;
    } catch (error) {
        console.error("Error fetching access token:", error);
    }
}

// Takes access token and uses it to call the API
async function callAPI(latitude, longitude, radius) {
    const token = await generateAccessToken();

    if (!token) {
        console.log("No access token available");
        return;
    }

    const endpoint = `/shopping/activities?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;

    try {
        const response = await fetch(`https://test.api.amadeus.com/v1${endpoint}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);
        if (data && data.data) {
            displayActivities(data.data);
        } else {
            displayActivities([]);
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

const cityProfiles = {
  "Madrid":   { budget: "low",    weather: "mild",  activity: "museum" },
  "Berlin":   { budget: "medium", weather: "cold",  activity: "museum" },
  "London":   { budget: "high",   weather: "mild",  activity: "culinary" },
  "New York": { budget: "medium", weather: "cold",  activity: "culinary" },
  "Paris":    { budget: "high",   weather: "mild",  activity: "museum" },
  "Rome":     { budget: "medium", weather: "warm",  activity: "culinary" }
};

const cityCoordinates = {
  "Madrid":   { latitude: 40.4168, longitude: -3.7038 },
  "Berlin":   { latitude: 52.52,   longitude: 13.4050 },
  "London":   { latitude: 51.5074, longitude: -0.1278 },
  "New York": { latitude: 40.7128, longitude: -74.0060 },
  "Paris":    { latitude: 48.8566, longitude: 2.3522 },
  "Rome":     { latitude: 41.9028, longitude: 12.4964 }
};

function displayActivities(activities) {
    const activityList = document.getElementById("activity-list");
    activityList.innerHTML = "";

    // Limit to first 10 activities and show name + description only
    activities.slice(0, 10).forEach(activity => {
        const li = document.createElement("li");
        li.textContent = activity.name;
        if (activity.description) {
            li.textContent += `: ${activity.description}`;
        }
        activityList.appendChild(li);
    });
}

function getBestMatch(preferences) {
  let bestCity = null;
  let highestScore = -1;

  for (const [city, profile] of Object.entries(cityProfiles)) {
    let score = 0;

    if (preferences.budget && preferences.budget === profile.budget) score++;
    if (preferences.weather && preferences.weather === profile.weather) score++;
    if (preferences.activity && preferences.activity === profile.activity) score++;

    if (score > highestScore) {
      highestScore = score;
      bestCity = city;
    }
  }

  return bestCity || "New York"; 
}


document.getElementById("preference-quiz").addEventListener("submit", async function (e) {
  e.preventDefault();

  const preferences = {
    budget: document.getElementById("budget").value || null,
    weather: document.getElementById("weather").value || null,
    activity: document.getElementById("activity").value || null,
    radius: parseInt(document.getElementById("radius").value) || 10
  };

  const recommended = getBestMatch(preferences);
  document.getElementById("recommended-city").innerText = `Recommended City: ${recommended}`;

  const { latitude, longitude } = cityCoordinates[recommended];
  await callAPI(latitude, longitude, preferences.radius);


});



