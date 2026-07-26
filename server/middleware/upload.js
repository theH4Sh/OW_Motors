const multer = require('multer')
const AppError = require('../utils/AppError')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname + '-' + uniqueSuffix)
    }
})

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new AppError('Only PNG, JPG, and WebP images are allowed', 400))
    }
}

const upload = multer({
    storage,
    fileFilter
})

module.exports = upload