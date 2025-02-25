import multer from "multer";
import path from "path";

// กำหนดพื้นที่เก็บไฟล์และตั้งชื่อไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// ตรวจสอบประเภทของไฟล์
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed (jpeg, jpg, png, gif)"));
  }
};

// จำกัดขนาดไฟล์ 5MB
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
};

// ส่งออกการตั้งค่า Multer
export const upload = multer({
  storage,
  fileFilter,
  limits,
});
