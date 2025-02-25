import mongoose, { Schema } from "mongoose";
import {getCurrentUser} from "../../controllers/user.controller.js";


const userSchema = new Schema(
    {
        username: {
            type: String,
            require: [true, "Username is require."],
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },

        email: {
            type: String,
            require: [true, "Email is require."],
            unique: true,
            lowercase: true
        },

        fullname: {
            type: String,
            require: [true, "Full name is required"],
            trim: true,
            index: true,
        }
    },
    {
        timestamps: true,
    }
);

export const createPatientCurrentDoctor = (req) => {
    try {
        
    console.log("Data has come.", req.username);
    
    const modelName = `${req.username}_user`

    return mongoose.model(modelName, userSchema);
} catch (error) {
        console.log(error);
}
}
// export const Patient1 = mongoose.model(`${doctor}User`, userSchema);