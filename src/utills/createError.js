module.exports = (message, statuscode) => {
    const error = new Error(message);
    error.statusCode = statuscode;
    throw error
}