import express from 'express';
import path from 'path';

//Import array of middleware functions
import middleware from './middleware';

//Get a router from express
let router = express.Router();

//Hook in middleware
router.use(middleware);

//Serve static files for the client
router.use('/css', express.static(__dirname + '/css'));
router.use('/js', express.static(__dirname + '/js'));
router.use('/assets', express.static(__dirname + '/assets'));
router.use('/client', express.static(__dirname + '/client'));

//Return the client main HTML when they request the default path
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

export default router;
