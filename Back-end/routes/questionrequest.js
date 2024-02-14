const express = require('express');
const router = express.Router();

const Questions = require('../models/question')
const Answers = require('../models/answer')

const {S3Client, GetObjectCommand, PutObjectCommand} = require('@aws-sdk/client-s3')
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner")

const crypto = require('crypto');
const sharp = require('sharp');

const multer = require('multer');
const storage = multer.memoryStorage();

const upload = multer({storage: storage}); // Initialize multer for handling form data

const bucketName=process.env.AWS_BUCKET_NAME;
const bucketRegion=process.env.AWS_REGION;
const accessKey=process.env.AWS_ACCESS_KEY;
const secretAccessKey=process.env.AWS_SECRET_KEY;

const s3Client = new S3Client({
  credentials: {
    accessKeyId:accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
})

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

router.post('/post/questionrequest'
, upload.single('image')
, async (req, res) => {
    const {title, body, uid} = req.body;
    const image = req.file;
    console.log(req.body);
    console.log(image);
    //resize the image
    // const buffer = await sharp(req.file.buffer).resize({height: 1920, width: 1080, fit:"contain"}).toBuffer();
    const imageName = randomImageName();
    console.log("Image name", imageName)
    const params = {
      Bucket: bucketName,
      Key: imageName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    
      const question = new Questions({
          RequestBy: uid,
          title: title,
          body: body,
          image: imageName // Assign the S3 URL to the image field if an image was uploaded
      });
      // Save the question to the database
      res.status(200).json({sucess:'Image has been successfully saved'});
      await question.save();
})



router.get('/deleteAll', async (req, res) => {
  try {
    let deletedCount = 0;
    const batchSize = 1; // Adjust batch size as needed
    let result;
    do {
      result = await Questions.deleteMany({}).limit(batchSize);
      deletedCount += result.deletedCount;
    } while (result.deletedCount > 0);
    res.send(`Deleted ${deletedCount} documents successfully`);
  } catch (error) {
    console.error('Error deleting documents:', error);
    res.status(500).send('An error occurred while deleting documents');
  }
});


router.get('/questions', async (req, res) => {
    try {
        const questions = await Questions.find({})
        .populate('RequestBy')
        .populate({
          path: "answers",
          // options: {limit: 1},
          populate: [
            
            {
              path: "User",
            }]
        })
        .populate('likes')

        for(const q of questions) {
          const GetObjectParams = {
            Bucket : bucketName,
            Key: q.image,
          }
        const command = new GetObjectCommand(GetObjectParams);
        url = await getSignedUrl(s3Client, command, {expiresIn: 60});
        q.imageUrl = url;
        q.likesCount = q.likes.length
      }
        res.status(200).json(questions);    
              
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching questions' });
    }
});

router.post('/post/like', async (req, res)=>{
  const {qid, uid, trueOrFalse} = req.body;
  try {
    const updateQuery = trueOrFalse
      ? { $pull: { likes: uid } } // Add user ID to likes if false
      : { $addToSet: { likes: uid } }; // Remove user ID from likes if true

    const updatedQuestion = await Questions.findOneAndUpdate(
      { _id: qid },
      updateQuery,
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const successMessage = trueOrFalse ? 'Successfully liked' : 'Successfully disliked';
    res.status(200).json({ success: successMessage });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
})
router.post('/post/comment', async (req, res) => {
  const {body,uid,qid} = req.body;
  try{
  const answer = new Answers({
      User: uid,
      question: qid,
      body: body,
  })
  const newAnswer = await answer.save();
  const aid = newAnswer._id.toString();
  // res.send(answer)
  // Find the question by its ID
  const question = await Questions.findOne({ _id: qid });
  if (question) {
    // Add the answer's _id to the question's answers array
    question.answers.push(aid);
    await question.save();
    res.status(200).json({ success: 'Answer saved successfully', answer: newAnswer });
  } else {
    res.status(404).json({ error: 'Question not found' });
  }
} catch (error) {
  res.status(500).json({ error: 'Failed to save the answer' });
}
});

router.get('/comments/:questionId', async (req, res) => {
  const questionId = await req.params.questionId;
  try {
  const answers = await Answers.find({ question: questionId })
  .populate('User');

  const comments = answers.map(answer => ({
    body: answer.body,
    qid: answer.question,
    user: answer.User.fullname
  }));
    
  res.status(200).json(comments);
}
    catch(error) {
      console.error('Error fetching comments', error);
      res.status(500).json({ error: 'An error occurred while fetching comments' });
    };
});


router.get('/post/likeCount/:postId', async (req, res) => {
  const qid = await req.params.postId;
  try {
  const question = await Questions.findOne({ _id: qid })
  const likeCount = question.likes.length;

  res.status(200).json(likeCount);
}
    catch(error) {
      console.error(error);
      res.status(500);
    };
});
module.exports = router;