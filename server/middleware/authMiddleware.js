const jwt = require('jsonwebtoken');
const UserModel = require('../models/Users');

module.exports.verifyUser = (req,res,next) => {
    const token = req.cookies.token
    if (!token) {
        res.locals.user =null;
        return res.json({valid: false,message:"Vous n'etes pas connecté ! (pas de token)"})
    }
    else {
        jwt.verify(token,process.env.TOKEN_SECRET,async (err,decoded) => {
            if (err) {
                res.locals.user =null;
                return res.json({valid: false,message:"Vous n'etes pas connecté ! (pas de token)"})} // pas de token 
            else {
                    let user = await UserModel.findById(decoded.id).select('-password');
                    req.userRole = decoded.userRole
                    res.locals.user =user;
                    next()
            }
        })
    }
}

module.exports.requireAuth = (req, res, next) => {

    const token = req.cookies.token;
    if (token) {
        jwt.verify(token, process.env.TOKEN_SECRET, async (err, decoded) => { 
            if(err){
                res.status(200).send("No Token");
            }
            else{
                console.log(decoded.id)
                next()
            }
        })
    }else res.status(200).send("No Token")

}

module.exports.admin = (req,res,next) => {
    if (req.userRole === "admin"){
        next()
    }
}


