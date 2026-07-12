const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const config = require("../config/env");
const AppError = require("../utils/AppError");

const uploadDir = path.join(process.cwd(), config.UPLOAD_DIR);

const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDirExists(uploadDir);
ensureDirExists(path.join(uploadDir, "images"));
ensureDirExists(path.join(uploadDir, "documents"));
ensureDirExists(path.join(uploadDir, "avatars"));
ensureDirExists(path.join(uploadDir, "thumbnails"));

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = uploadDir;
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      dest = path.join(uploadDir, "images");
    } else {
      dest = path.join(uploadDir, "documents");
    }
    ensureDirExists(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `File type "${file.mimetype}" is not allowed. Allowed types: ${ALLOWED_IMAGE_TYPES.concat(ALLOWED_DOCUMENT_TYPES).join(", ")}`,
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
  },
});

const uploadSingle = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(
          new AppError(`File too large. Maximum size is ${config.MAX_FILE_SIZE / (1024 * 1024)}MB.`, 400)
        );
      }
      return next(new AppError(`Upload error: ${err.message}`, 400));
    }
    if (err) return next(err);
    next();
  });
};

const uploadMultiple = (fieldName, maxCount = 5) => (req, res, next) => {
  upload.array(fieldName, maxCount)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(
          new AppError(`File too large. Maximum size is ${config.MAX_FILE_SIZE / (1024 * 1024)}MB.`, 400)
        );
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return next(new AppError(`Too many files. Maximum is ${maxCount} files.`, 400));
      }
      return next(new AppError(`Upload error: ${err.message}`, 400));
    }
    if (err) return next(err);
    next();
  });
};

const uploadFields = (fields) => (req, res, next) => {
  upload.fields(fields)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(
          new AppError(`File too large. Maximum size is ${config.MAX_FILE_SIZE / (1024 * 1024)}MB.`, 400)
        );
      }
      return next(new AppError(`Upload error: ${err.message}`, 400));
    }
    if (err) return next(err);
    next();
  });
};

async function processImage(filePath, options = {}) {
  const {
    width = 800,
    height = 600,
    quality = 80,
    format = "webp",
    thumbnail = true,
  } = options;

  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const name = path.basename(filePath, ext);

  const resizedPath = path.join(dir, `${name}-resized.${format}`);

  await sharp(filePath)
    .resize(width, height, { fit: "inside", withoutEnlargement: true })
    .toFormat(format, { quality })
    .toFile(resizedPath);

  let thumbnailPath = null;
  if (thumbnail) {
    thumbnailPath = path.join(dir, "..", "thumbnails", `${name}-thumb.${format}`);
    ensureDirExists(path.dirname(thumbnailPath));

    await sharp(filePath)
      .resize(200, 200, { fit: "cover" })
      .toFormat(format, { quality: 70 })
      .toFile(thumbnailPath);
  }

  return { resizedPath, thumbnailPath };
}

function deleteFile(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  processImage,
  deleteFile,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  uploadDir,
};
