const express = require("express")
const decryptController=require('../controllers/dechiffrementControllers');
const { verifyUser, admin } = require("../middleware/authMiddleware");

const router = express.Router()
router.get("/startDecrypt",[verifyUser,admin],decryptController.startDecrypt)
router.get("/endDecrypt",[verifyUser,admin],decryptController.endDecrypt)
router.get("/verifyAllDecrypt",[verifyUser,admin],decryptController.verifyAllDecrypt)
router.post("/decrypt",[verifyUser,admin],decryptController.decrypt)

module.exports=router;