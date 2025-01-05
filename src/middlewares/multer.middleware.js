import multer from "multer";

//  multer diskStorage copy code
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb call back
    cb(null, "/public/tem");
    // '/public/tem' which address store file.
  },
  filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname); // Use original filename
  },
});

// Export the configured multer upload instance
export const upload = multer({ 
    storage,
 });
