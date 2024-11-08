const Account = require("../models/account");
const chat = require("../models/chat");
const mongoose = require("mongoose");
const awaitMessage = require("../models/awaitMessage");
const Config = require("../dbConfig/rdbconfig");
const sql = require("mssql");

exports.FindChatAwait = (req, res, next) => {

    awaitMessage.find({ OwnUser: req.userData.username })
        .exec()
        .then(async (re1) => {
            if (re1.length >= 1) {
                var results = [];
                for (var i = 0; i < re1[0].awaittext.length; i++) {
                    try {
                        let pool = await sql.connect(Config);

                        let profiles = await pool.request()
                            .input('ID_Signin', sql.VarChar, re1[0].awaittext[i].from)
                            .query("SELECT [HoTen], [AnhSV] FROM [dbo].[InfoSinhVien] where InfoSinhVien.Email = @ID_Signin");

                        //console.log(facultys.recordsets[0]);
                        if (profiles.recordsets[0]) {
                            // re1[0].awaittext[i].from = profiles.recordsets[0][0]["HoTen"];
                            // console.log(profiles.recordsets[0][0]);


                            //var leng = re1[i].chat.length;
                            var temp = {
                                "idChatRoom": re1[0].awaittext[i].idChatRoom,
                                "name": profiles.recordsets[0][0]["HoTen"],
                                "Email": re1[0].awaittext[i].from,
                                "Anh": profiles.recordsets[0][0]["AnhSV"],
                                "TypeRoom": "TwoPeople",
                                "text": re1[0].awaittext[i].text,
                                "time": parseInt(re1[0].awaittext[i].time),
                                "state": re1[0].awaittext[i].state,
                            }
                            if (results !== undefined) {
                                results.push(temp);
                            }
                            else {
                                results = temp;
                            }
                            //console.log(results);

                        }
                        else {
                            res.status(500).json({ err: "err" });
                        }

                    }
                    catch (error) {
                        console.log(error);
                        res.status(500).json(error);
                    }
                    //res.status(200).json(re1[0]);
                }

                res.status(200).json(results);
            }
            else {
                res.status(200).json({ message: "Message await is Empty" });
            }
        })
        .catch(err => {
            res.status(500).json({ err: err });
        })
};

exports.FindChatUser = (req, res, next) => {

    chat.find({ "User": { $all: [req.userData.username] } })
        .exec()
        .then(async (re1) => {
            if (re1.length >= 1) {
                var results = [];
                //chay vong lap for tung nguoi ma user do da nhan tin
                for (var i = 0; i < re1.length; i++) {
                    var Usertemp;
                    if (re1[i].User[0] === req.userData.username) {
                        Usertemp = re1[i].User[1];
                    }
                    else {
                        Usertemp = re1[i].User[0];
                    }
                    try {
                        let pool = await sql.connect(Config);

                        let profiles = await pool.request()
                            .input('ID_Signin', sql.VarChar, Usertemp)
                            .query("SELECT [HoTen],[AnhSV] FROM [dbo].[InfoSinhVien] where InfoSinhVien.Email = @ID_Signin");

                        //console.log(facultys.recordsets[0]);
                        if (profiles.recordsets[0]) {
                            if (re1[i].chat.length >= 1) {
                                var leng = re1[i].chat.length;
                                var temp = {
                                    "idRoom": re1[i]._id,
                                    "name": profiles.recordsets[0][0]["HoTen"],
                                    "Email": Usertemp,
                                    "Anh": profiles.recordsets[0][0]["AnhSV"],
                                    "TypeRoom": "TwoPeople",
                                    "EmailEnd": re1[i].chat[leng - 1].from,
                                    "text": re1[i].chat[leng - 1].text,
                                    "time": parseInt(re1[i].chat[leng - 1].time),
                                    "state": re1[i].chat[leng - 1].state,
                                }
                                if (results !== undefined) {
                                    results.push(temp);
                                }
                                else {
                                    results = temp;
                                }
                                //console.log(results);
                            }
                        }
                        else {
                            res.status(500).json({ err: "err" });
                        }

                    }
                    catch (error) {
                        //console.log(error);
                        res.status(500).json(error);
                    }
                }
                //results.sortBy()
                //var sortedObjs = results.sortBy( results, "time" );
                //console.log(sortedObjs);
                res.status(200).json(results);
            } else {
                res.status(200).json({ message: "Message is Empty" });
            }
        })
        .catch(err => {
            res.status(500).json({ err: err });
        })

    //res.status(200).json(results);
}

exports.LoadMessage = async (req, res, next) => {
    await chat.find({ _id: req.body.IDRoom })
        .exec()
        .then(async (re1) => {
            if (re1.length >= 1) {
                var results = [];
                var listchat = re1[0].chat;
                var startpage = (re1[0].chat.length - 1) - (20 * parseInt(req.body.page));
                var endpage = (re1[0].chat.length - 1) - (20 ** parseInt(req.body.page)) - 20;

                if (parseInt(listchat.length / 20) < parseInt(req.body.page)) {
                    res.status(500).json({ message: "page not found" });
                }
                //console.log(re1[0].chat.length-1);
                //console.log(startpage);
                //console.log(endpage);
                for (var i = startpage; i > endpage; i--) {
                    if (listchat[i] === undefined) {
                        break;
                    }
                    if (results !== undefined) {
                        results.push(listchat[i]);
                    }
                    else {
                        results = listchat[i];
                    }
                    //console.log(listchat[i]);
                };
                if (req.userData.username !== re1[0].chat[re1[0].chat.length - 1].from) 
                {
                    chat.updateOne({
                        "_id": re1[0]._id,
                        "chat._id": re1[0].chat[re1[0].chat.length - 1]._id
                    },
                        {
                            $set: { "chat.$.state": "true" }
                        }
                        , (err, doc) => {
                            if (err) {
                                console.log("err", err);
                            } else {
                                console.log("doc:", doc);
                            }
                        });
                }

                console.log("1");
                res.status(200).json(results);
            } else {
                res.status(200).json({ message: "You dont have message" });
            }
        })
        .catch(err => {
            res.status(500).json({ err: err });
        })

};

