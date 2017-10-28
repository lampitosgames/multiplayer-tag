let requestTime = (req, res, next) => {
    req.reqTime = Date.now();
    next();
}

export default [requestTime];
