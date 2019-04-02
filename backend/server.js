const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const logger = require("morgan");
const cors = require("cors");

const app = express();
const router = app.Router();
const backendPort  = 3001;

