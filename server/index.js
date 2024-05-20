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
app.use(cors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization',
}));
app.use(express.json());
app.use(bodyParser.json())
app.use(cookieParser())
app.get('*',verifyUser)
app.get("/jwtid",requireAuth,(req,res)=>{

    console.log("local" + res.locals.user)
    res.status(201).send(res.locals.user);
})

app.use("/auth", userRouter);
app.use("/vote",voteRouter);
app.use("/admin",decryptRouter);

// Connection a notre base de données de Mango DB
mongoose.connect("mongodb+srv://"+process.env.DB_USER+"@cluster0.w1hgrto.mongodb.net/")

app.listen(process.env.PORT, () => console.log("serveur started "));