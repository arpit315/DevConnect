// --- WHAT IS THIS FILE? ---
// In a large application, we don't want to rewrite the try-catch block for every single route.
// This is a "wrapper" function. It takes our async route handler, executes it, and if there's an error,
// it automatically catches it and passes it to Express's next() error handling middleware.
// --------------------------

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        // Execute the handler inside a Promise so we can catch any rejections (errors)
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export { asyncHandler };
