const express = require("express");
//const bodyParser = require('body-parser');

const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const fileupload = require("express-fileupload");

const accountRoutes = require("./API/routes/account");
const universityRouter = require("./API/routes/university");
const facultyRouter = require("./API/routes/faculty");
const profileRouter = require("./API/routes/profile");
const webcustomRouter = require("./API/routes/customweb");
const deadlineMoodleRouter = require("./API/routes/deadlineMoodle");
const CheckAuthRouter = require("./API/routes/checkauth");
const StudyCoursesRouter = require("./API/routes/studyCourses");
const coursesContentRouter = require("./API/routes/coursesContent");
const calendarRouter = require("./API/routes/calendar");
const chatRouter = require("./API/routes/chat");
const infoAndNewsRouter = require("./API/routes/infoAndnews");
const notificationRouter = require("./API/routes/notification");
const forum = require("./API/routes/forum");
const forumMoodleRouter = require("./API/routes/forumMoodle");
const AutoRequestcheckChange = require("./API/autoRequest/checkChange");
//mongoose.connect("mongodb+srv://EMU:appEMU@cluster0.oktkb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
mongoose.connect("mongodb+srv://EMU:appEMU@cluster0.oktkb.mongodb.net/EMU?retryWrites=true&w=majority",
  {
    useMongoClient: true
  });
mongoose.set('useFindAndModify', false);

var minutesDeadline = 15, the_interval_Deadline = minutesDeadline *60 * 1000;
setInterval(function() {
  AutoRequestcheckChange.Check_Change_Deadline_Moodle();
}, the_interval_Deadline);

var minutesCourses = 120, the_interval_Courses = minutesCourses * 60 * 1000;
setInterval(function() {
  AutoRequestcheckChange.Check_Change_Content_Moodle();
  AutoRequestcheckChange.check_Change_New_Courses();
}, the_interval_Courses);

var minutesNews = 120, the_interval_News = minutesNews * 60 * 1000;
setInterval(function() {
  console.log("start");
  AutoRequestcheckChange.Check_Change_News_Unisersity();
  AutoRequestcheckChange.check_Change_News_Faculty();
}, the_interval_News);

var minutesGraph = 200, the_interval_Graph = minutesGraph * 60 * 1000;
setInterval(function() {
  console.log("start grap");
  AutoRequestcheckChange.check_New_Courses_Graph();
}, the_interval_Graph);

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileupload({useTempFiles: true}));

app.use("/account", accountRoutes);
app.use("/university", universityRouter);
app.use("/faculty", facultyRouter);
app.use("/profile", profileRouter);
app.use("/web", webcustomRouter);
app.use("/deadlinemoodle", deadlineMoodleRouter);
app.use("/checktoken", CheckAuthRouter);
app.use("/studycourses", StudyCoursesRouter);
app.use("/coursescontent", coursesContentRouter);
app.use("/calendar", calendarRouter);
app.use("/chat", chatRouter);
app.use("/info", infoAndNewsRouter);
app.use("/notification",notificationRouter);
app.use("/forum",forum);
app.use("/forummoodle",forumMoodleRouter);

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
    }
  });
});

module.exports = app;
