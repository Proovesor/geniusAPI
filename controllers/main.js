const genius = require("../models/genius");

const { validationResult } = require("express-validator/check");

exports.mainPage = (req, res, next) => {
    res.render("main", {
        searchError: false,
        initialValue: null,
    });
};

exports.postSearch = async (req, res, next) => {
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
            initialValue: artistName,
        });
    }

    try {
        const artistId = await genius.getArtistByName(artistName);

        const response = await genius.songsByArtist(artistId, {
            per_page: 1,
            sort: "popularity",
        });

        fullTitle = response.songs[0].full_title;
        title = fullTitle.split(" ");
        index = artistName.split(" ").length;
        for (let i = 0; i < title.length; i++) {
            if (title[i].includes("by") && i + 1 > index) {
                break;
            }
            finalTitle += ` ${title[i]}`;
        }

        const url = response.songs[0].url;
        const finalResponse = await genius.getLyrics(url);
        console.log(finalResponse);

        res.status(200).render("lyrics", {
            artist: artistName,
            title: fullTitle,
            lyrics: finalResponse,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
