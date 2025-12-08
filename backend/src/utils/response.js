/**
 * Standard success response
 */
export function successResponse(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
}

/**
 * Standard error response
 */
export function errorResponse(res, message = 'Error occurred', statusCode = 500, errors = null) {
    const response = {
        success: false,
        message
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
}

/**
 * Paginated response
 */
export function paginatedResponse(res, data, pagination, message = 'Success') {
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            total: pagination.total,
            limit: pagination.limit,
            offset: pagination.offset,
            hasMore: pagination.offset + pagination.limit < pagination.total
        }
    });
}
