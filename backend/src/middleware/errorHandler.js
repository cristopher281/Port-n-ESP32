/**
 * Global error handler middleware
 */
export function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // Default error
    let status = err.status || 500;
    let message = err.message || 'Internal server error';

    // Handle specific error types
    if (err.name === 'ValidationError') {
        status = 400;
        message = err.message;
    }

    if (err.code === 'ER_DUP_ENTRY') {
        status = 409;
        message = 'Duplicate entry - resource already exists';
    }

    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        status = 404;
        message = 'Referenced resource not found';
    }

    res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
