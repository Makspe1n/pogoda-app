const input = document.getElementById("cityInput");
const button = document.getElementById("searchBtn");
const result = document.getElementById("result");


function getWeatherIcon(temp) {
    if (temp < 0) return "❄️";
    if (temp < 10) return "☁️";
    if (temp < 20) return "⛅";
    if (temp < 30) return "🌤️";
    return "🔥";
}


function formatWindSpeed(speed) {
    return `${Math.round(speed)} км/ч`;
}


async function getWeather() {
    const city = input.value.trim();
    
    if (city === "") {
        result.innerHTML = '<div class="error">⚠️ Пожалуйста, введите название города</div>';
        return;
    }

    result.innerHTML = '<div class="loading">🔍 Поиск города...</div>';
    
    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ru&format=json`;
        const geoResponse = await fetch(geoUrl);
        
        if (!geoResponse.ok) {
            throw new Error(`Ошибка геокодинга: ${geoResponse.status}`);
        }
        
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            result.innerHTML = '<div class="error">❌ Город не найден. Проверьте название и попробуйте снова</div>';
            return;
        }
        
        const location = geoData.results[0];
        const lat = location.latitude;
        const lon = location.longitude;
        const name = location.name;
        const country = location.country;
        

        result.innerHTML = '<div class="loading">🌤️ Получаем данные о погоде...</div>';
        

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,relative_humidity_2m,apparent_temperature&timezone=auto`;
        const weatherResponse = await fetch(weatherUrl);
        
        if (!weatherResponse.ok) {
            throw new Error(`Ошибка получения погоды: ${weatherResponse.status}`);
        }
        
        const weatherData = await weatherResponse.json();
        
        if (!weatherData.current) {
            throw new Error("Нет данных о погоде");
        }
        
        const temp = weatherData.current.temperature_2m;
        const windSpeed = weatherData.current.wind_speed_10m;
        const humidity = weatherData.current.relative_humidity_2m;
        const feelsLike = weatherData.current.apparent_temperature;
        
        const weatherIcon = getWeatherIcon(temp);
        

        result.innerHTML = `
            <div class="card">
                <div class="weather-icon">${weatherIcon}</div>
                <h2>${name}, ${country}</h2>
                <p><strong>🌡️ Температура:</strong> ${Math.round(temp)}°C</p>
                <p><strong>🤔 Ощущается как:</strong> ${Math.round(feelsLike)}°C</p>
                <p><strong>💨 Ветер:</strong> ${formatWindSpeed(windSpeed)}</p>
                <p><strong>💧 Влажность:</strong> ${humidity}%</p>
                <p><small>📍 Координаты: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°</small></p>
            </div>
        `;
        
    } catch (error) {
        console.error("Ошибка:", error);
        result.innerHTML = `<div class="error">⚠️ Ошибка при получении данных: ${error.message}<br>Пожалуйста, проверьте интернет-соединение и попробуйте снова</div>`;
    }
}


button.addEventListener("click", getWeather);


input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        getWeather();
    }
});


window.addEventListener("load", () => {
    input.value = "Вилюйск";
    getWeather();
});