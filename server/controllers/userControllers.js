const UserModel = require("../models/Users.js")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const objID = require('mongoose').Types.ObjectId;

module.exports.getUser = async(req,res) => { 
  const {userMail} = req.body;
  try {
    // Permet de vérifier que l'ID existe bien dans notre BD 
    const user = await UserModel.findOne({userMail});
    //Si l'user existe donc son ID est dans notr BD, alors on affiche un msg
    if (user) {
      return res.status(201).json({ message: "L'utilisateur existe déjà." });
    }
    return res.status(200).json({ message: "Nouveau utilisateur" });
  }catch (error) {
    return res.status(500).json({ message: "Error" });
  }
}

module.exports.getUsers = async (req, res) => {
  const users = await UserModel.find({ userRole: { $ne: 'admin' } }).select('-password');
  res.status(200).json(users);
};

module.exports.getAdmin = async(req,res) => { 
  return res.json({valid: true,message:"Vous etes autorisé ! "})
}

module.exports.register = async(req,res) => { 
  const {userMail,password,userRole} = req.body;

  try {

  // Supprime les anciens ID car j'ai changé le schéma en gros ca met a jour
  // await UserModel.collection.dropIndexes();

  // Création d'un ID random lors du register 
  const salt=await bcrypt.genSalt();
  const passwordHash= await bcrypt.hash(password, salt);
  const newUser = new UserModel({userMail,password:passwordHash,userRole});
  await newUser.save();
  
  // On envoit une réponse sous format JSON
  res.status(201).json({ID : newUser._id});
} catch (error) {
  console.error("Une erreur s'est produite lors de l'inscription :", error);
  res.status(500).json({ message: "Une erreur s'est produite lors de l'inscription." });
}
}

module.exports.login = async (req,res) => {
  const {userMail,password} = req.body;
  try {
    // On regarde si l'ID existe dans la BD 
    const user = await UserModel.findOne({userMail});

    if (!user) {
      return res.status(202).json({message:"L'utilisateur n'existe pas"});
    }
    const isPassword = await bcrypt.compare(password,user.password) 
    // const userRole = user.userRole
    
    if (isPassword) {
      const token = jwt.sign({id:user._id,userMail,userRole:user.userRole},process.env.TOKEN_SECRET, {expiresIn:"1d"})
      //res.cookie("token",token,{httpOnly: true, secure:true, sameSite: "strict"})
      return res.status(200).json({token,message:"Mot de passe Correct"});
    }
    else {return res.status(201).json({token:null,message:"Mauvais mdp"});}
  } catch (error) {
    console.error("Une erreur s'est produite lors de l'inscription :", error);
    res.status(500).json({ message: "Une erreur s'est produite lors de l'inscription." });
  }
}

module.exports.logout = (req, res) => {
  res.clearCookie('token')
  return res.json({valid: true})
}

module.exports.deleteUser = async (req, res) => {
  if (!objID.isValid(req.params.id))
    return res.status(400).send("ID inconnu : " + req.params.id);

  try {
    await UserModel.findOneAndDelete({ _id: req.params.id });
    res.status(200).json({ message: "Suppression reussit !!!" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

