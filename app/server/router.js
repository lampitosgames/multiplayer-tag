import express from 'express';
import path from 'path';

//Import array of middleware functions
import middleware from './middleware';

//Get a router from express
let router = express.Router();
//Use middleware
router.use(middleware);

//Serve static files for the client
router.use(express.static(path.join(__dirname, '..', "client")));

//Route to the default client
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', "index.html"));
});

export default router;
