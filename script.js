
const API_KEY = "9b8cb36d5dc84d5e93b91546262807";

const BASE_URL = "https://api.weatherapi.com/v1";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const suggestionsBox = document.getElementById("suggestions");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");

const weatherContent = document.getElementById("weatherContent");
const emptyState = document.getElementById("emptyState");


const cityName = document.getElementById("cityName");
const locationDetails = document.getElementById("locationDetails");

const localTime = document.getElementById("localTime");
const localDate = document.getElementById("localDate");

const weatherIcon = document.getElementById("weatherIcon");

const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const feelsLike = document.getElementById("feelsLike");

const conditionText = document.getElementById("conditionText");
const uvIndex = document.getElementById("uvIndex");

const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const visibility = document.getElementById("visibility");
const cloud = document.getElementById("cloud");

const pressure = document.getElementById("pressure");
const windDirection = document.getElementById("windDirection");
const precipitation = document.getElementById("precipitation");
const gust = document.getElementById("gust");

const lastUpdated = document.getElementById("lastUpdated");

let searchTimeout;

cityInput.addEventListener("input", () => {

    const query = cityInput.value.trim();

    clearTimeout(searchTimeout);

    if (query.length < 2) {
        suggestionsBox.style.display = "none";
        suggestionsBox.innerHTML = "";
        return;
    }
    searchTimeout = setTimeout(() => {

        getCitySuggestions(query);

    }, 350);

});

async function getCitySuggestions(query) {

    try {

        const url =
            `${BASE_URL}/search.json?key=${API_KEY}&q=${encodeURIComponent(query)}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Could not search cities.");
        }

        const cities = await response.json();

        displaySuggestions(cities);

    } catch (error) {

        console.error(error);

        suggestionsBox.style.display = "none";

    }

}

function displaySuggestions(cities) {

    suggestionsBox.innerHTML = "";

    if (!cities || cities.length === 0) {

        suggestionsBox.innerHTML = `
            <div class="suggestion">
                <strong>No cities found</strong>
                <span>Try another search</span>
            </div>
        `;

        suggestionsBox.style.display = "block";

        return;
    }

    cities.slice(0, 6).forEach(city => {

        const item = document.createElement("div");

        item.className = "suggestion";

        item.innerHTML = `
            <strong>${escapeHTML(city.name)}</strong>

            <span>
                ${escapeHTML(city.region || "")}
                ${city.region ? ", " : ""}
                ${escapeHTML(city.country)}
            </span>
        `;

        item.addEventListener("click", () => {

            cityInput.value = city.name;

            suggestionsBox.style.display = "none";

            getWeather(`${city.name}, ${city.country}`);

        });

        suggestionsBox.appendChild(item);

    });

    suggestionsBox.style.display = "block";
}
searchBtn.addEventListener("click", () => {

    searchWeather();

});


cityInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        event.preventDefault();

        searchWeather();

    }
});

function searchWeather() {

    const city = cityInput.value.trim();

    if (!city) {
        showError("Please enter a city name.");
        return;
    }
    suggestionsBox.style.display = "none";
    getWeather(city);

}
async function getWeather(city) {

    showLoading();

    hideError();

    try {

        const url =
            `${BASE_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no`;

        const response = await fetch(url);

        const data = await response.json();


        if (!response.ok || data.error) {

            throw new Error(
                data.error?.message || "Unable to get weather data."
            );

        }
        updateWeatherUI(data);

    } catch (error) {

        console.error(error);
        showError(error.message);
        weatherContent.classList.add("hidden");
        emptyState.classList.remove("hidden");
    } finally {

        hideLoading();

    }

}

function updateWeatherUI(data) {

    const location = data.location;
    const current = data.current;

    cityName.textContent = location.name;

    locationDetails.textContent =
        `${location.region ? location.region + ", " : ""}${location.country}`;

    
    updateDateTime(location.localtime);

    temperature.textContent =
        Math.round(current.temp_c);

    feelsLike.textContent =
        Math.round(current.feelslike_c);

    condition.textContent =
        current.condition.text;
    conditionText.textContent =
        current.condition.text;

    weatherIcon.src =
        "https:" + current.condition.icon;
    weatherIcon.alt =
        current.condition.text;

    humidity.textContent =
        `${current.humidity}%`;
    wind.textContent =
        `${current.wind_kph} km/h`;
    visibility.textContent =
        `${current.vis_km} km`;
    cloud.textContent =
        `${current.cloud}%`;
    uvIndex.textContent =
        current.uv;
    pressure.textContent =
        `${current.pressure_mb} mb`;
    windDirection.textContent =
        `${current.wind_dir} (${current.wind_degree}°)`;
    precipitation.textContent =
        `${current.precip_mm} mm`;
    gust.textContent =
        `${current.gust_kph} km/h`;
    lastUpdated.textContent =
        `Updated: ${current.last_updated}`;
    updateBackground(
        current.temp_c,
        current.is_day,
        current.condition.code
    );
    emptyState.classList.add("hidden");
    weatherContent.classList.remove("hidden");
}
function updateDateTime(localTimeString) {
    const date = new Date(
        localTimeString.replace(" ", "T")
    );
    localTime.textContent =
        date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    localDate.textContent =
        date.toLocaleDateString([], {
            weekday: "long",
            month: "short",
            day: "numeric"
        });
}
function updateBackground(temp, isDay, conditionCode) {
    let background;
    if (!isDay) {
        background = `
            radial-gradient(
                circle at 20% 20%,
                rgba(59, 130, 246, .18),
                transparent 35%
            ),
            linear-gradient(
                135deg,
                #020617,
                #172554,
                #1e1b4b
            )
        `;

    }
    else if (temp >= 35) {

        background = `
            radial-gradient(
                circle at 20% 20%,
                rgba(251, 146, 60, .5),
                transparent 35%
            ),
            linear-gradient(
                135deg,
                #7c2d12,
                #c2410c,
                #ea580c
            )
        `;
    }
    else if (temp >= 25) {
        background = `
            radial-gradient(
                circle at 20% 20%,
                rgba(250, 204, 21, .35),
                transparent 35%
            ),
            linear-gradient(
                135deg,
                #164e63,
                #155e75,
                #0369a1
            )
        `;
    }
    else if (temp >= 15) {
        background = `
            radial-gradient(
                circle at 20% 20%,
                rgba(56, 189, 248, .35),
                transparent 35%
            ),
            linear-gradient(
                135deg,
                #0f172a,
                #164e63,
                #1d4ed8
            )
        `;
    } 
    else {
        background = `
            radial-gradient(
                circle at 20% 20%,
                rgba(125, 211, 252, .35),
                transparent 35%
            ),
            linear-gradient(
                135deg,
                #172554,
                #1e3a8a,
                #334155
            )
        `;
    }
    document.body.style.background = background;
}
function showLoading() {
    loading.classList.remove("hidden");
}
function hideLoading() {
    loading.classList.add("hidden");
}
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
}

function hideError() {

    errorMessage.classList.add("hidden");

}

document.addEventListener("click", (event) => {

    if (!event.target.closest(".search-box")) {
        suggestionsBox.style.display = "none";
    }

});

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
getWeather("New Delhi");