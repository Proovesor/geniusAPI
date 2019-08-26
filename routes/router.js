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
      .custom(async (value, { req }) => {
        const result = await genius.getArtistByName(req.body.phrase);
        if (!result) {
          return Promise.reject("Such artist could not be found!");
        }
      })
  ],
  mainControllers.postSearch
);

module.exports = router;
