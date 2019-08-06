const Genius = require("genius-api");
const genius = new Genius(process.env.GENIUS_API_TOKEN);

const cheerio = require("../util/cheerio");

const fetch = require("node-fetch");

Genius.prototype.getArtistByName = function getArtistByName(name) {
  const normalize = name =>
    name
      .replace(/\./g, "")
      .replace(/^\s+/g, "")
      .toLowerCase();

  const normalizedName = normalize(name);

  return this.search(name)
    .then(response => {
      let song = response.hits.find(hit => {
        if (
          //checking due to unexpected charAt(0) in certain cases
          normalize(hit.result.primary_artist.name).charAt(0) !==
          normalizedName.charAt(0)
        ) {
          hit.result.primary_artist.name = hit.result.primary_artist.name.slice(
            1,
            hit.result.primary_artist.name.length
          );
        }
        return (
          hit.type === "song" &&
          normalize(hit.result.primary_artist.name) === normalizedName
        );
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

Genius.prototype.getLyrics = function getLyrics(songUrl) {
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
