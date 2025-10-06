const apiKey = "bb11f84031064f44ab893256253006"; // Make sure this is correct

document.getElementById("getWeatherBtn").addEventListener("click", () => {
  const city = document.getElementById("cityInput").value.trim();
  const result = document.getElementById("weatherResult");

  if (!city) {
    result.textContent = "Please enter a city name.";
    return;
  }

  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then((data) => {
      const temperature = data.main.temp;
      result.textContent = `The weather in ${city} is ${temperature}°C`;
    })
    .catch((error) => {
      result.textContent = error.message;
    });
});
