const input = document.querySelector("#cityInput");
const btn = document.querySelector("#searchBtn");
const loader = document.querySelector("#loader");
const result = document.querySelector("#result");
const errorBox = document.querySelector("#error");

const elCity = document.querySelector("#cityName");
const elTemp = document.querySelector("#temperature");
const elText = document.querySelector("#weatherText");
const elEmoji = document.querySelector("#weatherEmoji");
const elWind = document.querySelector("#wind");
const elHum = document.querySelector("#humidity");
const elTZ = document.querySelector("#timezone");
const elUpd = document.querySelector("#updated");
const elForecast = document.querySelector("#forecast");

const WEATHER = {
  0: { text: "Ясно", emoji: "☀️", background: "https://t3.ftcdn.net/jpg/00/86/47/02/360_F_86470245_iyT43BKYT2OF4ODiNOvuWb8sL94K8ZFg.jpg" },
  1: { text: "Преимущественно ясно", emoji: "🌤️", background: "https://images.stockcake.com/public/a/3/c/a3c0404f-92af-46d1-b00f-b4e93ed73709_large/sunny-blue-sky-stockcake.jpg" },
  2: { text: "Переменная облачность", emoji: "⛅", background: "https://img.freepik.com/free-photo/natural-sky-clouds-background_661209-101.jpg?semt=ais_hybrid&w=740&q=80" },
  3: { text: "Пасмурно", emoji: "☁️", background: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRO88S3dcm9bXZm7JXxlK-iTfn2lAo55l7a7xpMCkPN58OOBwCSY2eEF9sRwIi3rniukYo&usqp=CAU" },
  45: { text: "Туман", emoji: "🌫️", background: "https://images.unsplash.com/photo-1444837881208-4d46d5c1f127?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZvZ3xlbnwwfHwwfHx8MA%3D%3D" },
  48: { text: "Изморозь", emoji: "🌫️", background: "https://thumbs.dreamstime.com/b/winter-landscape-evening-sunset-snow-frost-januar-january-nature-background-trees-sunlight-beautiful-scenery-129145897.jpg" },
  51: { text: "Лёгкая морось", emoji: "🌦️", background: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcST7VdjljvlYZlhAKaC-Zln7BInKHGcorUMPcIL9QxSG79ObscbenfPbs39jmjHpGRr10Y&usqp=CAU" },
  53: { text: "Морось", emoji: "🌦️", background: "https://cdn.pixabay.com/photo/2018/05/18/22/43/drizzle-3412251_1280.jpg" },
  55: { text: "Сильная морось", emoji: "🌧️", background: "https://aif-s3.aif.ru/images/020/625/bfd44480e33f21167b282acbb2e0610e.jpg" },
  61: { text: "Лёгкий дождь", emoji: "🌦️", background: "https://img.freepik.com/free-photo/weather-effects-composition_23-2149853295.jpg?semt=ais_hybrid&w=740&q=80" },
  63: { text: "Дождь", emoji: "🌧️", background: "https://wallpapershome.com/images/wallpapers/rain-wallpaper-3840x2160-high-resolution-8k-6496.jpg" },
  65: { text: "Ливень", emoji: "🌧️", background: "https://ichef.bbci.co.uk/ace/standard/2048/cpsprodpb/f697/live/48381df0-63d0-11f0-999c-79495cb3f5d9.jpg" },
  71: { text: "Снег", emoji: "🌨️", background: "https://plus.unsplash.com/premium_photo-1675147924852-69f8060a9acc?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  73: { text: "Снегопад", emoji: "❄️", background: "" },
  75: { text: "Сильный снег", emoji: "❄️", background: "https://media.istockphoto.com/id/614956164/photo/night-snowfall.jpg?s=612x612&w=0&k=20&c=gWPEno0ybZwJu5KOUQDQoR_BhyOSq_UGe27HrkMJFng=" },
  80: { text: "Ливневый дождь", emoji: "🌧️", background: "https://ichef.bbci.co.uk/ace/standard/2048/cpsprodpb/f697/live/48381df0-63d0-11f0-999c-79495cb3f5d9.jpg" },
  95: { text: "Гроза", emoji: "⛈️", background: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnj1D-QUeh9Khjf70DUtvxf67wen807uRD7w&s" },
};

btn.addEventListener("click", () => {
  const city = input.value.trim();
  if (!city) {
    showError("Введите название города");
    return;
  }
  loadByCity(city);
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") btn.click();
});

async function loadByCity(city) {
  try {
    toggleLoading(true);
    hideError();

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city
    )}&count=1&language=ru&format=json`;

    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) throw new Error("Ошибка геокодинга");

    const geoData = await geoRes.json();
    const place = geoData?.results?.[0];

    if (!place) throw new Error("Город не найден");

    const { latitude, longitude, name, country, timezone } = place;

    const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

    const wRes = await fetch(wUrl);
    if (!wRes.ok) throw new Error("Не удалось получить погоду");

    const wData = await wRes.json();

    renderCurrent({ name, country, timezone }, wData.current, wData.timezone);
    renderForecast(wData.daily);
  } catch (err) {
    showError(err.message || "Что-то пошло не так");
  } finally {
    toggleLoading(false);
  }
}

function renderCurrent(place, current, tz) {
  const label = `${place.name}${place.country ? ", " + place.country : ""}`;
  const code = current?.weather_code;
  const wm = WEATHER[code] || { text: "Неизвестно", emoji: "❔", background: "" };

  elCity.textContent = label;
  elTemp.textContent =
    current?.temperature_2m != null
      ? Math.round(current.temperature_2m) + "°"
      : "—";
  elText.textContent = wm.text;
  elEmoji.textContent = wm.emoji;
  elWind.textContent = current?.wind_speed_10m ?? "—";
  elHum.textContent = current?.relative_humidity_2m ?? "—";
  elTZ.textContent = tz ?? place?.timezone ?? "—";
  elUpd.textContent = new Date().toLocaleString();

  result.classList.remove("hidden");

  const wrapper = document.querySelector(".wrapper");
  if (wm.background) {
    wrapper.style.backgroundImage = `url("${wm.background}")`;
    wrapper.style.backgroundSize = "cover";
    wrapper.style.backgroundPosition = "center";
  }
}

function renderForecast(daily) {
  elForecast.innerHTML = "";
  if (!daily?.time?.length) return;

  const daysCount = Math.min(daily.time.length, 7);

  for (let i = 0; i < daysCount; i++) {
    const date = daily.time[i];
    const code = daily.weather_code?.[i];
    const tmax = daily.temperature_2m_max?.[i];
    const tmin = daily.temperature_2m_min?.[i];
    const wm = WEATHER[code] || { text: "—", emoji: "❔" };

    const div = document.createElement("div");
    div.className = "card-day";
    div.innerHTML = `
      <div class="date">${new Date(date).toLocaleDateString()}</div>
      <div class="text">${wm.text}</div>
      <div class="temps">${Math.round(tmin)}° / ${Math.round(tmax)}°</div>
    `;
    elForecast.appendChild(div);
  }
}

function toggleLoading(show) {
    const loader = document.getElementById("loader");
    if (!loader) return;
    loader.classList.toggle("hidden", !show); 
    result.classList.toggle("hidden", show); 
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");
  result.classList.remove("hidden");
}

function hideError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

toggleLoading(false);
loadByCity("Bishkek");
