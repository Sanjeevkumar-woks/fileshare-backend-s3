const router = require("express").Router();
const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3');
const auth = require("../middlewares/middleware");
require("dotenv").config();

//AWS configration
aws.config.update({
  secretAccessKey: process.env.ACCESS_SECRET,
  accessKeyId: process.env.ACCESS_KEY,
  region: process.env.REGION,
});
const BUCKET = process.env.BUCKET
const s3 = new aws.S3();

//Multer configration for upload multiple files
const upload = multer({
  storage: multerS3({
    s3: s3,
    acl: "public-read",
    bucket: BUCKET,
    key: function (req, file, cb) {
      const uuid = req.header("uuid");
      cb(null, `${uuid}/${file.originalname}`)
    }
  })
})

//Upload file post route
router.post('/upload', auth, upload.any('myfile'), async function (req, res, next) {
  const uuid = req.header("uuid");
  let r = await s3.listObjectsV2({ Bucket: BUCKET, Prefix: `${uuid}/` }).promise();
  res.send(r.Contents)
})

//Get all the files list
router.get("/list", auth, async (req, res) => {
  const uuid = req.header("uuid");
  if (!uuid) {
    res.send({ error: "unauthorized acess" })
  }
  let r = await s3.listObjectsV2({ Bucket: BUCKET, Prefix: `${uuid}/` }).promise();
  res.send(r.Contents)
})

//Delete file by filename
router.delete("/delete/:filename", auth, async (req, res) => {
  const uuid = req.header("uuid");
  await s3.deleteObject({ Bucket: BUCKET, Key: `${uuid}/${req.params.filename}` }).promise();
  let r = await s3.listObjectsV2({ Bucket: BUCKET, Prefix: `${uuid}/` }).promise();
  res.send(r.Contents);
});

//Downloade file with filename
router.get("/download/:filename", auth, (req, res) => {
  const uuid = req.header("uuid");
  if (!uuid) {
    res.status(401).send({ error: "unauthorized acess" })
  }
  //genrating signedURL for the download link
  const s3 = new aws.S3();
  const params = {
    Bucket: BUCKET,
    Key: `${uuid}/${req.params.filename}`,
    Expires: 1, // 1 sec
  };
  const signedUrl = s3.getSignedUrl('getObject', params);
  res.send({ signed_url: signedUrl });
});

//genrating digned url with 24hrs validity foe sharing file
router.get("/share/:filename", (req, res) => {
  const uuid = req.header("uuid");
  if (!uuid) {
    res.status(401).send({ error: "unauthorized acess" })
  }
  //genrating signed url
  const s3 = new aws.S3();
  const params = {
    Bucket: BUCKET,
    Key: `${uuid}/${req.params.filename}`,
    Expires: 3600 * 24, // 1 hour
  };
  const signedUrl = s3.getSignedUrl('getObject', params);
  res.send({ sharedlink: signedUrl });
});

//File send by email post route
router.post("/send", (req, res) => {
  const { sharedlink, emailTo, emailFrom } = req.body;
  if (!sharedlink || !emailTo || !emailFrom) {
    return res.status(422).send({ error: 'All fields are required' });
  }
  //sending email throuh nodemailer
  const sendMail = require('../services/emailServices');
  sendMail({
    from: emailFrom,
    to: emailTo,
    subject: "fileshare File sharing",
    text: `${emailFrom} shared a file with you.`,
    html: require('../services/emailTemplate')({
      emailFrom,
      downloadLink: sharedlink,
      size: 1000,
      expires: '24 hours' //expires in 24hrs
    })

  });

  res.send({ msg: "Email sent Succesfuly" })
});



module.exports = router;