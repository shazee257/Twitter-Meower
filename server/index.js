const dotenv = require("dotenv");
const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");
const app = express();
const Filter = require("bad-words");

const rateLimit = require("express-rate-limit");

const Mew = require("./models/Mew");

const filter = new Filter();

// Load config
dotenv.config({ path: "./config/config.env" });

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.json({ message: "Hello testing message!" });
});

app.get("/mews", async (req, res) => {
  const mews = await Mew.find();
  res.json(mews);
});

function isValidMew(mew) {
  return (
    mew.name &&
    mew.name.toString().trim() !== "" &&
    mew.content &&
    mew.content.toString().trim() !== ""
  );
}

app.use(rateLimit({ windowMs: 30 * 1000, max: 1 }));

app.post("/mews", async (req, res) => {
  if (isValidMew(req.body)) {
    const mew = {
      name: filter.clean(req.body.name.toString()),
      content: filter.clean(req.body.content.toString()),
    };
    const createdMew = await Mew.create(mew);
    res.json(createdMew);
  } else {
    res.status(422);
    res.json({ message: "Name and Content are required!" });
  }
});

app.listen(5000, () =>
  console.log("Server is running on http://localhost:5000")
);
