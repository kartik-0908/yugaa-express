// src/app.ts
import express from 'express';
import router from './routes/v1';
var cors = require('cors')
const app = express();

app.use(cors())
app.use(express.json())



app.use('/v1', router);

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
