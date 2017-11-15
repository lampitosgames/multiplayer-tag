"use strict";

//THIS IS JUST A TEST MIDDLEWARE FILE

//Add a timestamp to the request
let requestTime = (req, res, next) => {
    req.reqTime = Date.now();
    next();
}

//Export an array of middleware functions to be bound by the router
export default[requestTime];
