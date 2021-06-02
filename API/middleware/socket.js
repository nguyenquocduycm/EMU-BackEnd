const socket_io = require('socket.io');
const Account = require("../models/account");
const chat = require("../models/chat");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const UserConnect = [];
const Room = [];

exports.OnSocket = (socket) => {
    var idsocket = socket.id;
    socket.on("Start", (user) => {
        var userconnect = {
            idsoc: idsocket,
            username: user
        }
        if (UserConnect !== undefined) {
            UserConnect = userconnect;
        } else {
            UserConnect.push(userconnect);
        }
    })
    var FromUser
    socket.on("Create-Room", (user) => {
        try {
            const decoded = jwt.verify(user[0], process.env.JWT_KEY);
            FromUser = decoded.username;
            if (FromUser.length >= 1) {
                Account.find({ username: FromUser })
                    .exec()
                    .then(re1 => {
                        if (re1.length >= 1) {
                            //socket.emit("Reply-Create-Room","created")
                            Account.find({ username: user[1] })
                                .exec()
                                .then(re2 => {
                                    if (re2.length >= 1) {
                                        chat.find({ "User": { $all: [FromUser.toString(), user[1].toString()] } })
                                            .exec()
                                            .then(re3 => {
                                                if (re3.length >= 1) {
                                                    socket.emit("Reply-Create-Room", re3[0]._id);
                                                    socket.join(re3[0]._id);
                                                }
                                                else {
                                                    var Chat = new chat({
                                                        _id: new mongoose.Types.ObjectId(),
                                                        User: [re1[0].username, re2[0].username],
                                                        TypeRoom: "TwoPeple",
                                                        chat: []
                                                    })

                                                    var Idroom = Chat._id;
                                                    Chat.save()
                                                        .then(() => {
                                                            socket.emit("Reply-Create-Room", Idroom.toString());
                                                            socket.join(Idroom);
                                                        })
                                                        .catch(err => {
                                                            socket.emit("Reply-Create-Room", "error");
                                                        })
                                                }
                                            })
                                            .catch(err => {
                                                socket.emit("Reply-Create-Room", "error");
                                            })
                                    } else {
                                        socket.emit("Reply-Create-Room", "error");
                                    }
                                })
                        } else {
                            socket.emit("Reply-Create-Room", "error");
                        }
                    })
            }
            else {
                socket.emit("Reply-Create-Room", "error");
            }
        } catch (error) {
            socket.emit("Reply-Create-Room", "error");
        }
    })

    socket.on("Private-Message", (user) => {
        var FromUser;
        const decoded = jwt.verify(user[1], process.env.JWT_KEY);
        FromUser = decoded.username;
        const found = UserConnect.some(el => el.username === user[2]);
        if (found) {
            //neu co user connect
            
        } else {
            //neu ko co userconnect
            const currentDate = new Date();
            const timestamp = currentDate.getTime();
            Chat.updateOne({
                _id: user[0]
                //$and: [{ IDCourses: element.IDCourses }, { url: urlcourses }]
            },
                {
                    $push: { chat: { from: FromUser, text: user[3], time: timestamp } }
                });
            //var usersend =[user[0]]
            socket.to(user[0]).emit("Private-Message", user);
        }

    });

    console.log('a user connecteddddddddddddddddddddddddddddddddddddddddddddddd');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
}