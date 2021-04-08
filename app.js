const express = require("express");
//const bodyParser = require('body-parser');

const app = express();
const mongoose= require("mongoose");
const morgan = require("morgan");
const cors=require("cors");
const accountRoutes=require("./API/routes/account");


//mongoose.connect("mongodb+srv://EMU:appEMU@cluster0.oktkb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
mongoose.connect("mongodb+srv://EMU:appEMU@cluster0.oktkb.mongodb.net/EMU?retryWrites=true&w=majority",
{
  useMongoClient: true
});

app.use(morgan('dev'));


//app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
//app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/account", accountRoutes);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
  });
  
  app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
      error: {
        message: error.message,
        errors: "as"
      }
    });
  });

module.exports=app;