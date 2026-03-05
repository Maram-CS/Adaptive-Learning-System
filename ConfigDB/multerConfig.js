import multer from "multer";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, join(__dirname, "../Public/uploads")); // specify the destination folder for uploaded files
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = file.originalname.split(".").pop();
        cb(null, file.fieldname + "-" + uniqueSuffix + "." + extension);
    }
});

export const upload = multer({ storage });