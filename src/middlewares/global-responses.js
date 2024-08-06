
// function to display errors messages
export const globalResponses = (err, req, res, next) => {
    if (err) {
        res.status(err['cause'] || 500).json({
            errMsg: err.message
        })
        next();
    }
}
