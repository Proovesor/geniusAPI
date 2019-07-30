const cheerio = require("cheerio");

exports.parseSongHTML = function(htmlText) {
  const $ = cheerio.load(htmlText);
  const lyrics = $(".lyrics").text();
  return lyrics;
};
