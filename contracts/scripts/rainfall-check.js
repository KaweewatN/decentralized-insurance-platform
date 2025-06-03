const axios = require("axios");

async function run() {
  const lat = parseFloat(args[0]) / 1e4;
  const lon = parseFloat(args[1]) / 1e4;
  const startDate = args[2];
  const endDate = args[3];
  const threshold = parseFloat(args[4]);
  const conditionType = args[5]; // should be "below" or "above"

  const toMMDD = (date) => date.split("-")[1] + date.split("-")[2];
  const year = startDate.split("-")[0];
  const start = `${year}${toMMDD(startDate)}`;
  const end = `${year}${toMMDD(endDate)}`;

  const params = {
    start,
    end,
    latitude: lat,
    longitude: lon,
    parameters: "PRECTOTCORR",
    community: "RE",
    format: "JSON",
  };

  const nasaUrl = "https://power.larc.nasa.gov/api/temporal/daily/point";

  try {
    const response = await axios.get(nasaUrl, { params });

    // Optional: log raw response for debugging
    console.log("✅ NASA API response received.");

    const data = response.data?.properties?.parameter?.PRECTOTCORR;

    if (!data) {
      console.log(
        "❌ PRECTOTCORR missing in response:",
        JSON.stringify(response.data, null, 2)
      );
      throw new Error("No rainfall data");
    }

    const totalRain = Object.values(data).reduce((sum, val) => sum + val, 0);
    console.log(`🌧️ Total Rainfall = ${totalRain} mm`);
    console.log(`🔍 Condition = ${conditionType}, Threshold = ${threshold}`);

    if (conditionType === "below" && totalRain < threshold) {
      console.log("✅ Condition met: total rainfall is below threshold.");
      return true;
    } else if (conditionType === "above" && totalRain > threshold) {
      console.log("✅ Condition met: total rainfall is above threshold.");
      return true;
    } else {
      console.log("❌ Condition not met.");
      return false;
    }
  } catch (err) {
    console.error("❌ Error fetching or parsing rainfall data:", err.message);
    if (err.response) {
      console.error(
        "📦 Full response:",
        JSON.stringify(err.response.data, null, 2)
      );
    }
    throw new Error("Rainfall API failed");
  }
}
