const mongoose = require("mongoose");
var request = require("request");

const calendar = require("../models/calendar");
const CustomWeb = require("../models/customweb");
const deadlineMoodle = require("../models/deadlineMoodlle");
exports.Get_Calendar_This_Month = async (req, res, next) => {
    var listcalendar = [];
    //calendar.find({$and:[{"IDUser": req.userData._id},{Date:{$macth:[{year:req.body.year},{month:req.body.month}]}}]})
    await calendar.find({ $and: [{ IDUser: req.userData._id }, { "Date.year": req.body.year }, { "Date.month": req.body.month }] })
        .exec()
        .then(re1 => {
            if (re1.length >= 1) {
                listcalendar = re1;
            } else {
                res.status(500).json({ message: "No calendar this month" });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err });
        })

    var url;
    CustomWeb.find({ $and: [{ typeUrl: "Moodle" }, { idUser: req.userData._id }] })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                var tokenMoodle = user[0].token;
                var urlMoodle = user[0].url.split(".edu.vn")[0];

                var today = new Date();

                var mm = String(today.getMonth() + 1);
                var yyyy = today.getFullYear();

                var mm2 = parseInt(mm) + 1;

                url = urlMoodle + ".edu.vn/webservice/rest/server.php?moodlewsrestformat=json&wstoken=" + tokenMoodle + "&wsfunction=core_calendar_get_calendar_monthly_view&year=" + yyyy + "&month=" + mm;
                url2 = urlMoodle + ".edu.vn/webservice/rest/server.php?moodlewsrestformat=json&wstoken=" + tokenMoodle + "&wsfunction=core_calendar_get_calendar_monthly_view&year=" + yyyy + "&month=" + mm2.toString();
                //console.log(url);
                var options = {
                    "method": "GET",
                    "url": url,
                    "headers": {
                    }
                };

                var options2 = {
                    "method": "GET",
                    "url": url2,
                    "headers": {
                    }
                };
                var result = [];
                request(options, function (error, response) {
                    if (error) {
                        res.status(500).json({ message: error });
                    }
                    else {
                        if (response.statusCode === 200) {
                            //console.log(response.body);
                            var CalendarDeadline = JSON.parse(response.body);
                            //console.log(CalendarDeadline.weeks)

                            for (var i = 0; i < CalendarDeadline.weeks.length; i++) {
                                for (var j = 0; j < CalendarDeadline.weeks[i].days.length; j++) {
                                    if (CalendarDeadline.weeks[i].days[j].events != "") {
                                        for (var z = 0; z < CalendarDeadline.weeks[i].days[j].events.length; z++) {
                                            if (CalendarDeadline.weeks[i].days[j].events[z].modulename === "assign") {
                                                const deadline = new deadlineMoodle(
                                                    CalendarDeadline.weeks[i].days[j].events[z].course.fullname,
                                                    CalendarDeadline.weeks[i].days[j].events[z].name,
                                                    CalendarDeadline.weeks[i].days[j].events[z].url,
                                                    CalendarDeadline.weeks[i].days[j].events[z].timestart
                                                );
                                                listcalendar.push(deadline);
                                            }
                                        }


                                    }

                                }

                            }


                            res.status(200).json(listcalendar);
                        } else {
                            res.status(500).json({ message: "Have res error" });
                        }
                    }

                });
                console.log(result);
            }
            else {
                res.status(500).json({ message: "No account your custom Moodle" });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.Post_Calendar = (req, res, next) => {
    calendar.find({ $and: [{ IDUser: req.userData._id }, { Title: req.body.Title }, { "Date.year": req.body.year }, { "Date.month": req.body.month }, { "Date.day": req.body.day }] })
        .exec()
        .then(re1 => {
            if (re1.length >= 1) {
                res.status(200).json({ message: "your tilte is exist" });
            } else {

                Calendars = new calendar({
                    _id: new mongoose.Types.ObjectId(),
                    IDUser: req.userData._id,
                    Title: req.body.Title,
                    TypeEvent: req.body.TypeEvent,
                    Date: { year: req.body.year, month: req.body.month, day: req.body.day },
                    StartHour: req.body.StartHour,
                    EndHour: req.body.EndHour,
                    Decription: { text: req.body.desciptionText, underLine: req.body.UnderLine, italic: req.body.Italic, bold: req.body.Bold, url: req.body.url },
                    Color: req.body.Color,
                    Notification: req.body.Notification
                });
                console.log("1");
                Calendars.save()
                    .then(() => {
                        res.status(200).json({ message: "Calendar is created" });
                    }).catch((err) => {
                        console.log(err);
                        res.status(500).json({ error: err })
                    });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err })
        });
};

exports.Edit_Calendar = async (req, res, next) => {

    var newcalendar = new calendar({
        Title: req.body.newTitle,
        TypeEvent: req.body.TypeEvent,
        Date: { year: req.body.newyear, month: req.body.newmonth, day: req.body.newday },
        StartHour: req.body.StartHour,
        EndHour: req.body.EndHour,
        Decription: { text: req.body.desciptionText, underLine: req.body.UnderLine, italic: req.body.Italic, bold: req.body.Bold, url: req.body.url },
        Color: req.body.Color,
        Notification: req.body.Notification
    })
    //console.log(newcalendar);
    await calendar.findOneAndUpdate({ $and: [{ IDUser: req.userData._id }, { Title: req.body.Title }, { "Date.year": req.body.year }, { "Date.month": req.body.month }, { "Date.day": req.body.day }] },
        newcalendar, { upsert: false }, function (err, doc) {
            if (err) {
                res.status(500).json({ error: err });
            } else {
                if (doc) {
                    res.status(200).json({ message: "your calendar is updated" });
                } else {
                    res.status(500).json({ message: "No your calendar in db" });
                }
            }
        }).catch(err => {
            res.status(500).json({ error: err })
        })
    ///console.log(doc);
};

exports.Delete_Calendar = async (req, res, next) => {
    //const IDCalendar;
    await calendar.findOneAndRemove({ $and: [{ IDUser: req.userData._id }, { Title: req.body.Title }, { "Date.year": req.body.year }, { "Date.month": req.body.month }, { "Date.day": req.body.day }] })
        .exec()
        .then(re1 => {
            res.status(200).json({ message: "your Calendar is removed" });

        })
        .catch(err => {
            res.status(500).json({ error: err })
        });
};

