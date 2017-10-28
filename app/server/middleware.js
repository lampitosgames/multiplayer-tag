let requestTime = (req, res, next) => {
    req.reqTime = Date.now();
    next();
}

let addDucks = (req, res, next) => {
    req.duck = "Quack";
    next();
}

export default [requestTime, addDucks];
