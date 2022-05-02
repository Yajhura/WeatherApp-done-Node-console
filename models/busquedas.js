const fs = require("fs");
require("dotenv").config();
const axios = require("axios");

const KelvinACelcius = (kelvin) => {
  const celsius = kelvin - 273.15;

  return `${celsius.toFixed(2)}°C`;
};

class Busquedas {
  historial = [];
  dbPath = "./db/busquedas.json";

  constructor() {
    this.busqueda = [];
  }

  async buscarCiudad(ciudad = "") {
    try {
      const intance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ciudad}.json`,
        params: {
          access_token: process.env.TOKEN_MAP_BOX,
          limit: 5,
          language: "es",
        },
      });
      const { data } = await intance.get();
      return data.features.map((ciudad) => ({
        id: ciudad.id,
        ciudad: ciudad.place_name_es,
        lng: ciudad.center[0],
        lang: ciudad.center[1],
      }));
    } catch (error) {
      return console.log("No se encontro la ciudad", error);
    }
  }

  async buscarClima(lng = "", lang = "") {
    try {
      const intance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: {
          lat: lang,
          lon: lng,
          appid: process.env.TOKEN_OPEN_WEATHER,
          lang: "es",
        },
      });
      const { data } = await intance.get();

      return {
        temp: KelvinACelcius(data.main.temp),
        temp_max: `${KelvinACelcius(data.main.temp_max)} max`,
        temp_min: `${KelvinACelcius(data.main.temp_min)} min`,
        descripcion: data.weather[0].description,
      };
    } catch (error) {
      return console.log("No se encontro la ciudad", error);
    }
  }

  agregarHistorial(ciudad) {
    if (this.historial.includes(ciudad.toLocaleLowerCase())) {
      return;
    }
    this.historial = this.historial.splice(0, 5);

    this.historial.unshift(ciudad.toLocaleLowerCase());

    // Grabar en DB
    this.guardarDB();
  }

  get historialCapitalizado() {
    return this.historial.map((ciudad) => {
      let palabras = ciudad.split(" ");
      palabras = palabras.map((p) => p[0].toUpperCase() + p.substring(1));

      return palabras.join(" ");
    });
  }

  guardarDB() {
    const payload = {
      historial: this.historial,
    };

    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  cargarDB() {
    if (!fs.existsSync(this.dbPath)) return;

    const info = JSON.parse(fs.readFileSync(this.dbPath, "utf-8"));
    this.historial = info.historial;
  }
}

module.exports = Busquedas;
