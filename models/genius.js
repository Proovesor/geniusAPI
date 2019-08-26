const Genius = require("genius-api");
const genius = new Genius(process.env.GENIUS_API_TOKEN);

const cheerio = require("../util/cheerio");

const fetch = require("node-fetch");

Genius.prototype.getArtistByName = async function getArtistByName(name) {
  let song;

  const normalize = name =>
    name
      .replace(/\./g, "")
      .replace(/^\s+/g, "")
      .toLowerCase();

  const normalizedName = normalize(name);

  try {
    const response = await this.search(name);

    song = await response.hits.find(hit => {
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
      error.statusCode = 404;
      throw error;
    }

    return song.result.primary_artist.id;
  } catch (err) {
    if (!err.statusCode !== 500) {
      err.statusCode = 500;
    }
    throw err;
  }
};

Genius.prototype.getLyrics = async function getLyrics(songUrl) {
  try {
    const response = await fetch(songUrl, {
      method: "GET"
    });

    if (!response) {
      const error = new Error("Could not fetch url.");
      error.statusCode = 404;
      throw error;
    }
    const finalResponse = await response.text();
    return cheerio.parseSongHTML(finalResponse);
  } catch (err) {
    if (!err.statusCode !== 500) {
      err.statusCode = 500;
    }
    throw err;
  }
};

module.exports = genius;
