// --- WHAT IS THIS FILE? ---
// We want to standardize how we send errors back to the frontend.
// Instead of `{ error: "Not found" }` sometimes, and `{ message: "Bad" }` other times,
// we create a custom Error class extending Node's built-in Error.
// This ensures ALL errors have a statusCode, a message, and optional extra errors (like validation issues).
// --------------------------

class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null // We don't send data back on an error
        this.message = message
        this.success = false // A boolean flag for the frontend to quickly know it failed
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }
