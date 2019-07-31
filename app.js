require("dotenv").config({ path: ".env" });

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const router = require("./routes/router");
const defaultRoute = require("./routes/default");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", "views");

app.use(router);
app.use("/", defaultRoute.getDefault);

const port = 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
