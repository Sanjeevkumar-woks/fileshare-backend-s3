const express = require('express')
const app = express();
const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3');

require("dotenv").config();
app.listen(3001, () => console.log("server is running"));

aws.config.update({
    secretAccessKey: process.env.ACCESS_SECRET,
    accessKeyId: process.env.ACCESS_KEY,
    region: process.env.REGION,
});
const BUCKET = process.env.BUCKET
const s3 = new aws.S3();
const upload = multer({
    storage: multerS3({
        s3: s3,
        acl: "public-read",
        bucket: BUCKET,
        key: function (req, file, cb) {
            console.log(file);
            cb(null, `sanjeev/${file.originalname}`)
        }
    })
})

app.post('/upload', upload.any('myfile'), async function (req, res, next) {
    res.send('Successfully uploaded ' + ' location!')
})

app.get("/list", async (req, res) => {
    let r = await s3.listObjectsV2({ Bucket: BUCKET }).promise();
    let x = r.Contents.map(item => item.Key);
    res.send(x)
})


app.get("/download/:filename", async (req, res) => {
    const s3 = new aws.S3();
    const params = {
        Bucket: BUCKET,
        Key: req.params.filename,
        Expires: 50, // e.g., 3600 seconds (1 hour)
    };
    const signedUrl = await s3.getSignedUrl('getObject', params);
    res.send({'Signed URL': signedUrl});
})

app.delete("/delete/:filename", async (req, res) => {
    const filename = req.params.filename
    await s3.deleteObject({ Bucket: BUCKET, Key: filename }).promise();
    res.send("File Deleted Successfully")

})