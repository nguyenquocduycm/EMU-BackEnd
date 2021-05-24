const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chat");
const check_auth =require("../middleware/check-auth");

router.get("/",check_auth,chatController.User_connect);

module.exports=router;