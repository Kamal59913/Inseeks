const express = require('express');

const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');

// Set up AWS S3
const s3 = new aws.S3({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
    region: process.env.AWS_REGION, // replace with your S3 region
  });
  
  // Set up multer-s3 storage
  const uploadWithMulter = () => multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_BUCKET_NAME, // replace with your S3 bucket name
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        cb(null, Date.now().toString() + '-' + file.originalname);
      }
    })
  }).array("image", 2) //maximum two photo as of now


  uploadToAws = (req,res) => {
    const upload = uploadWithMulter();
    upload(req,res, err => {
        if(err){
            console.log(err);
            res.json({err,msg: 'Error Occured while uploading'})
            return 
        }
        res.json({msg: 'file uploaded successfully', files: req.files})
    })
  }

  const router = express.Router();
  router.post()