// src/app.ts
import express from 'express';
const router  = require("./routes/v1/reply")
const webhookRouter  = require("./routes/webhooks")
var cors = require('cors')
const app = express();

app.use(cors())
app .use('/webhooks', webhookRouter)
app.use('/v1', router);


app.get('/',(req,res)=>{
    console.log("inside api root")
    res.json({
        "message": "status ok!!"
    })
})

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
