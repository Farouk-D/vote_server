const mongoose = require("mongoose")

const VoteSchema = new mongoose.Schema ({
    
    clePub: {
        type: [String],
        required : true,
    },
    delta: {
        type: String,
        required : true,
    },
    dateEnd: {
        type: Date,
        required : true,
    },
    votes : {
        type: [String],
        default : []
    },
    deployed : {
        type : Boolean,
        default: false
    }
})

const VoteModel = mongoose.model("votes",VoteSchema)

module.exports = VoteModel;