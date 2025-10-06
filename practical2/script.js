const weatherData = {
  Ahmedabad: "42°C",
  Mumbai: "33°C",
  Delhi: "40°C",
  Bangalore: "29°C",
  Vadodara : "42°",
  Changa : "27°C",
};

document.getElementById("getWeatherBtn").addEventListener("click", () => {
  const city = document.getElementById("cityInput").value.trim();
  const result = document.getElementById("weatherResult");

  if (weatherData[city]) {
    result.textContent = `The weather in ${city} is ${weatherData[city]}`;
  } else {
    result.textContent = "City not found in database.";
  }
});
