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
  let fullTitle,
    title,
    index,
    finalTitle = "",
    spotiAPI;

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
      title = fullTitle.split(" ");
      index = artistName.split(" ").length;
      for (let i = 0; i < title.length; i++) {
        if (title[i].includes("by") && i + 1 > index) {
          break;
        }
        finalTitle += ` ${title[i]}`;
      }
      // spotify
      //   .search({
      //     type: "track",
      //     query: `${finalTitle}`
      //   })
      //   .then(response => {
      //     console.log(response.tracks.items[0].uri);
      //   })
      //   .catch(err => {
      //     if (!err.statusCode) {
      //       err.statusCode = 500;
      //     }
      //     next(err);
      //   });
      return response.songs[0].url;
    })
    .then(url => {
      return genius.getLyrics(url);
    })
    .then(response => {
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
