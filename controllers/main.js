const genius = require("../models/genius");

const { validationResult } = require("express-validator/check");

exports.mainPage = (req, res, next) => {
  res.render("main", {
    searchError: false,
    initialValue: null
  });
};

exports.postSearch = (req, res, next) => {
  const artistName = req.body.phrase;
  let fullTitle, text;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("main", {
      searchError: true,
      initialValue: artistName
    });
  }

  genius
    .getArtistByName(artistName)
    .then(artistId => {
      return genius.songsByArtist(artistId, {
        per_page: 1,
        sort: "popularity"
      });
    })
    .then(response => {
      fullTitle = response.songs[0].full_title;
      return response.songs[0].url;
    })
    .then(url => {
      return genius.getLyrics(url);
    })
    .then(response => {
      //   res.setHeader("Content-Type", "text/html");
      //   text = response.replace(/\n/gi, "<br />");
      res.status(200).render("lyrics", {
        artist: artistName,
        title: fullTitle,
        lyrics: response
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
