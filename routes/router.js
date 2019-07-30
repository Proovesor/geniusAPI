const express = require("express");
const router = express.Router();

const genius = require("../models/genius");

const { body } = require("express-validator/check");

const mainControllers = require("../controllers/main");

router.get("/main", mainControllers.mainPage);

router.post(
  "/main",
  [
    body("phrase")
      .isString()
      .custom((value, { req }) => {
        return genius.getArtistByName(req.body.phrase).then(result => {
          if (!result) {
            return Promise.reject("Such artist does not exist!");
          }
        });
      })
  ],
  mainControllers.postSearch
);

module.exports = router;
