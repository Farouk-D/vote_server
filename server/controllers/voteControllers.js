const objID = require('mongoose').Types.ObjectId;
const UserModel = require("../models/Users.js")
const VoteModel = require("../models/Vote.js")
const DechiffrementModel = require("../models/Dechiffrement.js")
const bigInt = require('big-integer');
const nodemailer=require("nodemailer")

module.exports.getVote = async(req,res) => {
    try {
        const vote = await VoteModel.findOne({});
        if (!vote) {
            return res.json({ valid: false, message: "Aucun vote est en cours! " });
        }
        const pubCle = vote.clePub
        const dateEnd = vote.dateEnd
        const deployed = vote.deployed
        return res.json({valid: true,pubCle,dateEnd,deployed});
    }catch (error) {
        return res.status(500).json({valid: false, message: "Error" });
    }
    
}

module.exports.getResult = async (req, res) => {
    try {
        const vote = await VoteModel.findOne({});
        const decrypt = await DechiffrementModel.findOne({});
        if (!vote || !decrypt) {
            return res.json({ valid: false, message: "Aucun vote ou déchiffrement est en cours!" });
        }
        if (vote.votes.length === 0) {
            return res.json({ valid: true, result:0 });
        }
        const decryptValue = parseInt(decrypt.decryptValue, 10);
        if (isNaN(decryptValue)) {
            return res.json({ valid: false, message: "Valeur de déchiffrement invalide!" });
        }
        console.log("Decrypt "+decryptValue)
        console.log("Decrypt "+vote.votes.length)
        const result = (decryptValue / vote.votes.length) * 100;
        console.log(result)
        return res.json({ valid: true, result });
    } catch (error) {
        return res.json({ valid: false, message: "Erreur" });
    }
};

module.exports.createVote = async (req,res) => {
    const {dateEnd} = req.body;
    const votes = await VoteModel.findOne({});
    if (!votes) {
        const key = createKeys()
        const newVote = new VoteModel({clePub:key[0],delta:key[1],dateEnd})
        await newVote.save()
        return res.json({valid:true,message:"Vote crée"})
    } else {
        return res.json({valid:false,message:"Un vote est déja en cours ! "})
    }
}
module.exports.deleteVote = async (req,res) => {
    try {
        const resultVote = await VoteModel.findOneAndDelete({});
        await DechiffrementModel.deleteOne({})

        if (resultVote) {
            await UserModel.updateMany({},{ $set: { userVoted: false }})
            return res.json({valid:true,message:"Le vote a bien été effacé et les utilisateurs peuvent re voter pour les prochains"})
        }
        else {
            return res.json({valid:false,message:"Aucun vote en cours"})
        }

    } catch (error) {
        return res.json({message: "Une erreur s'est produite lors de la suppression du vote" });
    }

}

module.exports.testVote = async(req,res) => {
    const {userId} = req.body
    if (!objID.isValid(userId) || req.params.id !== userId)
        return res.send({message:"Mauvais ID"});
    try {
        const user = await UserModel.findById(userId);
            if (!user) {return res.json({valid:false,message:"Utilisateur non existant"});} 
            else if (user.userVoted) {return res.json({valid:false,message:"Vous avez déja voté"});} 
            else {
                const existVote = await VoteModel.findOne({})
                if (existVote){
                    return res.json({valid:true,message:"On peut chiffrer le vote et l'envoyer au serveur"})
                }
                else {
                    return res.json({valid:false,message:"Aucun vote en cours"})
                }
            }
    } catch(error) {
        console.error("Une erreur s'est produite lors de la mise à jour :");
        return res.status(500).json({ message: "Une erreur s'est produite lors de la mise à jour" }); 
    }

}
module.exports.postVote = async (req,res) => {
    const {userId,voteTime,resultat} = req.body;
    try {
        const vote = await VoteModel.findOne({})
        if (vote.dateEnd.getTime() < voteTime) {
            return res.json({valid:false,message:"la date limite a été depassé ! "})
        }
        await VoteModel.findOneAndUpdate(
            {},
            {$push: { votes: resultat }},
            { new: true,upsert: false  }
        );
        await UserModel.findByIdAndUpdate(
            userId,
            { $set: { userVoted: true } },
            { new: true }
        );
        return res.json({valid:true,message:"Votre vote a bien été pris en compte"});

        } catch(error) {
            console.error("Une erreur s'est produite lors de la mise à jour :");
            return res.status(500).json({ message: "Une erreur s'est produite lors de la mise à jour" });
        }
}

const createKeys = () => {
    function factorielle(n) {
        // Calcul factorial n .
        if (n === 0 || n === 1) {
            return 1
        } else {
            return n * factorielle(n - 1)
        }
    }

    function Gen_Coprime(n){
        // Coprime generation function. Generates a random coprime number of n.
        let ret;
        while (true) {
            ret = bigInt.randBetween(1, n.minus(1));
            if (bigInt.gcd(ret, n) == 1) { 
                return ret
            }
        }
    }

    function timesMod(a, b, modulus) {
        // Modular multiplication. => (a.multiply(b)).mod(modulus).
        let temp = a.times(b)
        return temp.mod(modulus)
    }

    function keyGen(keyLength) {
        // Key generation : [p, q, p', q', n, m] with p, q, p' and q' are primes and p = 2p'+1, q = 2q'+1.
        // return n = pq and m = p'q'.
        console.log("\nStart generation key ...")
        let p, q, p_prime, q_prime, n
        do {
            do {
                do {
                    p = bigInt.randBetween(
                        bigInt(2).pow(keyLength/2),   
                        bigInt(2).pow((keyLength/2)+1).minus(1) 
                    ); 
                } while (!p.isProbablePrime());
                p_prime = p.subtract(bigInt(1)).divide(bigInt(2))
            } while (!p_prime.isProbablePrime())
            do {
                do {
                q = bigInt.randBetween(
                        bigInt(2).pow(keyLength/2),   
                        bigInt(2).pow((keyLength/2)+1).minus(1) 
                    ); 
                } while (!q.isProbablePrime());
                q_prime = q.subtract(bigInt(1)).divide(bigInt(2))
            } while (!q_prime.isProbablePrime())
            n = p.multiply(q)
        } while (p.eq(q) === 0 && p_prime.eq(q_prime) === 0 && bigInt.gcd(n, p.subtract(bigInt.one).multiply(q.subtract(bigInt.one))).toJSNumber() !== 1)
        let m = p_prime.multiply(q_prime)
        console.log("Key generation completed !")
        return [n, m]
    }

    function otherKey(n, m, nServer) {
        // Generate all other key with n and m.
        let g = n.add(bigInt(1))
        let beta = Gen_Coprime(n)
        let theta = timesMod(m, beta, n)
        let delta = bigInt(factorielle(nServer))
        return [g, beta, theta, delta]
    }

    function fX(aiList, x, mod) {
        // calcul f(x) for Shamir Split.
        let out = aiList[0]
        for (let i = 1; i < aiList.length; i++) {
            out = out.add(aiList[i].times(bigInt(x).pow(i))).mod(mod);
        }
        return out
    }

    function splitShamir(n, m, beta, nServer, neededDecrypt) {
        // Calcul 'nServer' split shamir with private key = beta * m based on degree function f(X) : neededDecrypt.
        let aiList = []
        aiList.push(beta.times(m))
        for (let i = 0; i < neededDecrypt-1; i++) {
            let ai = bigInt.randBetween(1, (n.multiply(m)).minus(1))
            aiList.push(ai)
        }
    
        let shamirs = []
        for (let j = 1; j <= nServer; j++) {
            let fj = fX(aiList, j, n.multiply(m))
            shamirs.push(fj.toString())
        }
        return shamirs
    }

    const keyLength = 512  // Bit length for key
    const nServer = 4  // Number of servers for split Shamir. Admit nServer > 2
    const neededDecrypt = 4  // Numbers of needed server for decryption. Admit 2 < neededDecrypt <= nServer

    let key = keyGen(keyLength)
    let n = key[0].toString(); let m = key[1].toString()
    let key2 = otherKey(bigInt(n), bigInt(m), nServer)
    let g = key2[0].toString(); let beta = key2[1].toString(); let theta = key2[2].toString(); let delta = key2[3].toString()

    let shamirSplit = splitShamir(bigInt(n), bigInt(m), bigInt(beta), nServer, neededDecrypt)
    console.log("\nSplit Shamir to ditributed : ")
    //const mails = ["clementpenn78@gmail.com","roukfadu78@hotmail.com","hedikashi@hotmail.com","Jemsen78@hotmail.com"]
    const mails = [process.env.ADMIN_1,process.env.ADMIN_2,process.env.ADMIN_3,process.env.ADMIN_4]
    for (let j = 1; j <= nServer; j++) {
        //console.log(j, ":", shamirSplit[j-1].toString())
        sendSecretKey(mails[j-1],j,shamirSplit[j-1].toString())
    }

    return [[n, g, theta], delta]
}

const sendSecretKey = async (email,indice,secretKey) => {
    
    var transporter = nodemailer.createTransport({
        host : 'smtp.gmail.com',
        port : 465,
        secure : true,
        auth: {
          user: "votedcrypt@gmail.com",
          pass: "rued eljw kzua cdtn",
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    var mailOptions = {
        to: email,
        subject: "Votre clé secrete + indice pour le déchiffrement",
        text: `Votre indice : ${indice}  
            Votre clé : ${secretKey} `,
    };
    try {
        await transporter.sendMail(mailOptions)
        return true;
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email:", error);
        return false;
    }
    
        
}