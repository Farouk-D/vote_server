const {verifyUser, admin}=require('../middleware/authMiddleware.js')
const voteControllers=require('../controllers/voteControllers');
const express = require("express")



const router = express.Router()


router.get("/getVote",voteControllers.getVote)
router.get("/getResult",verifyUser,voteControllers.getResult)
router.post("/createVote",[verifyUser,admin],voteControllers.createVote)
router.post("/testVote/:id",verifyUser,voteControllers.testVote)
router.post("/postVote",verifyUser,voteControllers.postVote)
router.delete("/deleteVote",[verifyUser,admin],voteControllers.deleteVote)

module.exports=router;