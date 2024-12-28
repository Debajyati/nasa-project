const path = require("path");
const { parse } = require("csv-parse");
const fs = require("fs");

const planets = require("./planets.mongo");

function isHabitable(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

async function loadPlanetsData() {
  const planetPromises = []; // Collect promises here
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler-data.csv"),
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        }),
      )
      .on("data", async (data) => {
        if (isHabitable(data)) {
          // Push the promise to the array
          planetPromises.push(saveplanets(data));
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        // Wait for all save operations to finish
        await Promise.all(planetPromises);
        resolve();
      });
  }).then(async () => {
    const countPlanetsFound = (await getAllPlanets()).length;
    console.log(`${countPlanetsFound} habitable planets found!!`);
  });
}

async function getAllPlanets() {
  return await planets.find({}, { _id: 0, __v: 0 });
}

async function saveplanets(planet) {
  try {
    await planets.updateOne(
      {
        keplerName: planet["kepler_name"],
      },
      {
        keplerName: planet["kepler_name"],
      },
      {
        upsert: true,
      },
    );
    console.log(`Planet ${planet["kepler_name"]} saved to DB`);
  } catch (error) {
    console.error(`Could not save planet! ${planet}`);
  }
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
