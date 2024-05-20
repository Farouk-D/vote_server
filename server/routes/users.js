const express = require("express")
const userController=require('../controllers/userControllers');
const { verifyUser, admin } = require("../middleware/authMiddleware");




// Pour expliquer en bref : une route c'est un chemin dans l'URL 
const router = express.Router()
router.post("/getUser", userController.getUser)
router.get("/getUsers" ,[verifyUser,admin], userController.getUsers)
router.post("/register", userController.register)
router.post("/login", userController.login)
router.get('/logout', verifyUser,userController.logout)
router.delete("/deleteUser/:id",[verifyUser,admin],userController.deleteUser)


module.exports=router;

