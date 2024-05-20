const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const userRouter = require("./routes/users.js")
const voteRouter = require("./routes/votes.js")
const decryptRouter = require("./routes/dechiffrement.js")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const { requireAuth, verifyUser } = require("./middleware/authMiddleware.js")
require('dotenv').config()



const app = express()

// Transforme toutes les données du FrontEnd en json
app.use(express.json());
app.use(cookieParser())
app.use(bodyParser.json())
app.use(cors({
    origin: [process.env.CLIENT_URL],
    credentials: true
}));

app.get('*',verifyUser)
app.get("/jwtid",requireAuth,(req,res)=>{
    console.log(res.locals.user)
    res.status(201).send(res.locals.user);
})

app.use("/auth", userRouter);
app.use("/vote",voteRouter);
app.use("/admin",decryptRouter);

// Connection a notre base de données de Mango DB
mongoose.connect("mongodb+srv://"+process.env.DB_USER+"@cluster0.w1hgrto.mongodb.net/")

// Lancer le serveur (on prend 3001 car 3000 est utilisé par le client)
app.listen(process.env.PORT, () => console.log("serveur started "));