const apiKey = "bb11f84031064f44ab893256253006"; 

    const getWeatherBtn = document.getElementById("getWeatherBtn");
    const cityInput = document.getElementById("cityInput");
    const resultDiv = document.getElementById("result");

    getWeatherBtn.addEventListener("click", () => {
      const city = cityInput.value.trim();
      if (city === "") {
        resultDiv.textContent = "Please enter a city name.";
        return;
      }

      const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`;

      fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error("City not found.");
          }
          return response.json();
        })
        .then(data => {
          const temp = data.current.temp_c;
          const condition = data.current.condition.text;
          resultDiv.textContent = `The temperature in ${data.location.name} is ${temp}°C with ${condition}.`;
        })
        .catch(error => {
          resultDiv.textContent = error.message;
        });
    });