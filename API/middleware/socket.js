const socket_io = require('socket.io');
const Account = require("../models/account");
const chat = require("../models/chat");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const io = require("socket.io")

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
    });
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
                                                    socket.join(re3[0]._id);
                                                    
                                                    io.sockets.in(re3[0]._id).emit("Reply-Create-Room", Idroom.toString());
                                                    
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
                                                            socket.join(Idroom);
                                                            io.sockets.in(Idroom).emit("Reply-Create-Room", Idroom.toString());
                                                            //socket.to(Idroom.toString()).emit("Reply-Create-Room", Idroom.toString());
                                                            
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
            const RoomMessage = Room.some(el => el.idRoom === user[0]);
            if(RoomMessage)
            {
                if(RoomMessage.chatcontext.length>=10){
                    //save into db
                }
                else{
                    socket.to(user[0]).emit("Private-Message", user);
                    
                }
            }
            else{
                Room.push({idRoom:user[0],chatcontext: []});
            }
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
            socket.to(user[0].toString()).emit("Private-Message", user);
        }

    });

    console.log('a user connecteddddddddddddddddddddddddddddddddddddddddddddddd');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
}