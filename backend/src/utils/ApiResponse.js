// --- WHAT IS THIS FILE? ---
// Just like we standardize errors with ApiError, we standardize successes with ApiResponse.
// This ensures that every successful API call returns data in the EXACT same format:
// { statusCode: 200, data: {...}, message: "Success", success: true }
// This makes our React frontend code much simpler!
// --------------------------

class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        // If status code is less than 400, it's considered a success
        this.success = statusCode < 400
    }
}

export { ApiResponse }
