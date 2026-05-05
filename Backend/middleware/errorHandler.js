// Global Express error handler — must have exactly 4 params to be recognized
const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${req.id || '-'} ${err.stack || err}`)

    const statusCode = err.statusCode || err.status || 500

    return res.status(statusCode).json({
        message: err.message || 'Something went wrong',
        error: true,
        success: false
    })
}

export default errorHandler
