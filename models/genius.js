const api = require("genius-api");
const genius = new api(process.env.GENIUS_API_TOKEN);

const cheerio = require("../util/cheerio");

const fetch = require("node-fetch");

api.prototype.getArtistByName = function getArtistByName(name) {
  const normalize = name => name.replace(/\./g, "").toLowerCase();

  const normalizedName = normalize(name);

  return this.search(name)
    .then(response => {
      let song;
      response.hits.find(hit => {
        if (
          hit.type === "song" &&
          normalize(hit.result.primary_artist.name) === normalizedName
        ) {
          song = hit;
        }
      });
      if (!song) {
        const error = new Error("Such artist does not exist.");
        error.statusCode = 422;
        throw error;
      }
      return Promise.resolve(song);
    })
    .then(song => {
      return song.result.primary_artist.id;
    })
    .catch(err => {
      if (!err.statusCode !== 500) {
        err.statusCode = 500;
      }
      throw err;
    });
};

api.prototype.getLyrics = function getLyrics(songUrl) {
  return fetch(songUrl, {
    method: "GET"
  })
    .then(response => {
      if (response) {
        return Promise.resolve(response.text());
      }
      const error = new Error("Could not fetch url.");
      error.statusCode = 422;
      throw error;
    })
    .then(cheerio.parseSongHTML)
    .catch(err => {
      if (!err.statusCode !== 500) {
        err.statusCode = 500;
      }
      throw err;
    });
};

module.exports = genius;
