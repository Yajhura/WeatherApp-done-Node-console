const {
  inquirerMenu,
  leerInput,
  pausa,
  listadoCiudades,
} = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async () => {
  const busquedas = new Busquedas();

  let opt = "";

  do {
    opt = await inquirerMenu("Seleccione una opción:");

    switch (opt) {
      case "1":
        // Buscar una ciudad
        const ciudad = await leerInput("Ingrese el nombre de la ciudad");
        const ciudades = await busquedas.buscarCiudad(ciudad);

        //mostrar listado de ciudades
        const id = await listadoCiudades(ciudades);
        if (id === "0") continue;

        //agregar  ciudad a historial
        const ciudadSelect = ciudades.find((c) => c.id === id);
        busquedas.agregarHistorial(ciudadSelect.ciudad);

        //buscar clima
        const { temp, temp_max, temp_min, descripcion } =
          await busquedas.buscarClima(ciudadSelect.lng, ciudadSelect.lang);

        //Mostrar Resultados
        console.log("Informacion de la ciudad:".green);
        console.log("\n");
        console.log("Nombre: ".red + `${ciudadSelect.ciudad}`);
        console.log("Latitud: ".red + `${ciudadSelect.lang}`);
        console.log("Longitud: ".red + `${ciudadSelect.lng}`);
        console.log("Temperatura: ".red + `${temp}`);
        console.log("Temperatura Maxima: ".red + `${temp_max}`);
        console.log("Temperatura Minima: ".red + `${temp_min}`);
        console.log("Descripcion: ".red + `${descripcion}`);

        break;
      case "2":
        //Historial de consultas
        busquedas.historialCapitalizado.map((h, i) => {
          const idx = `${i + 1}.`.green;
          console.log("\n");
          console.log(idx + h);
        });

        break;
      case "0":
        break;
    }

    await pausa();
  } while (opt !== "0");
};
main();
