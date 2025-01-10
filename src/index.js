// require('dotenv').config()
import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(
        `\n⚙ Server is running on port ${process.env.PORT || 8000} ✅\n\n`
      );
    });
  })
  .catch((error) => {
    console.log("\n MONGO DB connection failed !!!! ❌\n\n", error);
  });


  /*
import express from "express"
const app = express()

    // ife
    (async () => {
        try {
            mongoose.connect(`${process.env.MONGODB_URI} /${DB_NAME}`)
            app.on("error", (error)=>{
                console.log("ERROR: ", error);
                throw error;
            });
            
            app.listen(process.env.PORT, () => {
                console.log(`App is listening on port ${process.env.PORT}`);
            })
        }
        catch (error) {
            console.error("ERROR: ", error);
            throw err
        }
    })() */
