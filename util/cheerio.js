const cheerio = require("cheerio");

exports.parseSongHTML = htmlText => {
  const $ = cheerio.load(htmlText);
  const lyrics = $(".lyrics").text();
  return lyrics;
};
