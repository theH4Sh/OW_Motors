const AppError = require('../utils/AppError')

const errorHandler = (err, req, res, next) => {
    let status = err.status || err.statusCode || 500
    let message = err.message || 'Internal Server Error'

    if (err instanceof AppError) {
        status = err.status
        message = err.message
    } else if (err.name === 'ValidationError') {
        status = 400
        message = Object.values(err.errors || {})
            .map((e) => e.message)
            .join(', ') || 'Validation failed'
    } else if (err.name === 'CastError') {
        status = 400
        message = `Invalid ${err.path || 'id'}`
    } else if (err.code === 11000) {
        status = 409
        const field = Object.keys(err.keyPattern || {})[0] || 'field'
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already in use`
    } else if (err.name === 'MulterError') {
        status = 400
        message = err.message || 'Invalid file upload'
    } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        status = 401
        message = 'Invalid or expired token'
    }

    if (status >= 500) {
        console.error(err.stack || err)
        message = 'Internal Server Error'
    } else {
        console.warn(`[${status}] ${req.method} ${req.originalUrl}: ${message}`)
    }

    res.status(status).json({
        success: false,
        message,
        error: message
    })
}

module.exports = errorHandler
