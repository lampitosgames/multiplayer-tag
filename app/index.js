import express from 'express';
import router from './server/router';

const app = express();

app.use(router);

app.listen(8080, () => {
    console.log("Server listening on 8080");
});
