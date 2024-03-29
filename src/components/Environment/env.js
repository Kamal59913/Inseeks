import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import axios from 'axios';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import io from 'socket.io-client';

import "./homeEnv.css";
// import "./Comments.css"
function Env({}) {

  const location = useLocation();
  const selectedValue = location.state;

  // const Names = ['Family', 'College', 'Friends', 'Other'];

  // const {Family} = useParams();
  // const {College} = useParams();
  // const {Friends} = useParams();
  // const {Other} = useParams();
 
  const navigate = useNavigate();
  const url = "localhost";
  //localhost
  /*Displaying the questions*/
  const [questions, setQuestions] = useState([]);
  const [comments, setComments] = useState([]);
  const [currId, serCurrQId] = useState('');
  const [socket, setSocket] = useState(null);
  // const [like, setLike] = useState(false);
  const [likes, setLikes] = useState({});
  const [env, setEnv] = useState('null');
  

  useEffect(()=>{
    axios.get(`http://${url}:5000/questions`)
    .then((response) => {
          setQuestions(response.data);
          const val = localStorage.getItem('env');
          setEnv(val)
    })
    .catch((error) => {
          console.error('Error fetching the questions', error)
    })
}, []);


/*To get the comments*/
  /*Toggle Logic*/
  const [showMore, setShowMore] = useState(false);
  const toggleContent = () => {
    setShowMore(!showMore);
  };

  /*Date format logic*/
  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return `${(date.getMonth() + 1)}/${date.getDate()}/${date.getFullYear()}, ` +
      `${(date.getHours() % 12 || 12)}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() < 12 ? 'am' : 'pm'}`;
  }

  /*Getting User Data*/
  const userInitial = {}; // Initialize user as null
  const [userr, setUser] = useState(userInitial);
  const user = userr.id
  useEffect( () => {
    const fetchDatae = async () => {
            const response = await fetch(`http://${url}:5000/api/getuser`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem('token')
                },
            });
            if (response.ok) {
              const json = await response.json();
              // console.log(json);
              setUser(json);
          }
        }
        fetchDatae();
}, []);


useEffect(() => {
  const likedPosts = JSON.parse(localStorage.getItem('likedPosts'));
  if (likedPosts) {
    setLikes(likedPosts);
  }
}, []);

// Function to update local storage with liked posts
const updateLocalStorage = (likedPosts) => {
  localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
};


// Function to fetch updated like count for a specific question
const fetchUpdatedLikeCount = async (postId) => {
try {
  const response = await axios.get(`http://${url}:5000/post/likeCount/${postId}`);
  console.log('count is', response.data)
  return response.data; // Assuming the server returns likeCount in the response
} catch (error) {
  console.error(error);
  return 0;
}
};

//receiving the postId in this function
const toggleLike = async (postId) => {
  const isLiked = likes[postId] || false; //It is a logical OR operator, attemps to get likes based on key postId
  //true is likes[postId] exists
  console.log("checking out",isLiked)

  const userDetails ={
    qid: postId,
    uid: user,
    trueOrFalse: isLiked //false means liked, true means disliked
  }
try {
//inserting uid in Questions.likes if isLiked false, deleting remove uid from Question.likes isLiked is true.
  await axios.post(`http://${url}:5000/post/like`,userDetails)
  .then((response)=>{
    console.log(response)
  }).catch((err)=>{
    console.log(err)
  })
  const updatedLikeCount = await fetchUpdatedLikeCount(postId); //getting the likecount

  setLikes((prevLikes) => { 
    const updatedLikes = { ...prevLikes }; 
    updatedLikes[postId] = !updatedLikes[postId];
    updateLocalStorage(updatedLikes); // Update local storage with updated liked posts
    return updatedLikes;
  });
      // Update the question's like count in state
      setQuestions((prevQuestions) =>
      prevQuestions.map((question) =>
        question._id === postId ? { ...question, likesCount: updatedLikeCount } : question //if does not match then would return the 'question' object
      )
    );
  } catch (error) {
    console.error(error);
  }
};

// Fetch updated like counts for all questions when the component mounts
useEffect(() => {
const fetchAllUpdatedLikeCounts = async () => {
  const updatedQuestions = await Promise.all(
    questions.map(async (question) => {
      const updatedLikeCount = await fetchUpdatedLikeCount(question._id);
      return { ...question, likesCount: updatedLikeCount };
    })
  );
  setQuestions(updatedQuestions);
};

fetchAllUpdatedLikeCounts();
}, []);

  /*Socket Connecton*/
  useEffect(() => {
    const socketInstance = io(`http://${url}:5000`);
    setSocket(socketInstance);
  
    // listen for events emitted by the server
  
    socketInstance.on('connect', () => {
      console.log('Connected to server');
    });
  
    socketInstance.on('chat message', async (data) => {
        // console.log('Recieved message',data);
        setComments((prevComments) => [...prevComments, data]);
    });
  
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);
  //After adding the comments
  console.log("Here is the comments",comments)

  /*Doing post request to save the comments*/
  const [body, setBody] = useState('');

  const handleBodyChange = (event) => {
    setBody(event.target.value);
  };
  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://${url}:5000/comments/${currId}`); // Replace with your API endpoint for fetching comments
      if (response.status === 200) {
        setComments(response.data);

      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const commentdetail = {
      body: body,
      qid: currId,
      uid: user
    } //Form data was not working I think because there was no media files
    
    await  fetchComments()
    // fetchComments();
    socket.emit('chat message',commentdetail)
    
    axios.post(`http://${url}:5000/post/comment`,commentdetail)
    .then((response) => {
      if(response.status == 200) {
        // console.log("Success")
        // console.log(response.data)
        setBody('');
      }
    }).catch((err) => {
      console.log(err.response)
    })
  };
  const triggerEnv = async (event) =>{
    const selectedValue = event.currentTarget.getAttribute('value');
    const envUrl = `/env/${selectedValue}`
    console.log(selectedValue,"this",envUrl);

    await axios.get(`http://${url}:5000/home/${selectedValue}`) // Replace with your API endpoint for fetching comments
    .then((response)=>{
      if(response.status == 200) {
        navigate(`/env/${selectedValue}`)
        setEnv(selectedValue)
        localStorage.setItem('env',selectedValue)
      }
    }).catch((err)=>{
        console.log(err)
    })
  }
  return (
    <>
      <div className="container-home-env">
        <div className="left-sidebar-env">
        <h2>{env === 'null'? (<>
        {selectedValue}
        </>):(<>
        {env}
        </>)}</h2>

        </div>

<div className="main-content-env">

{questions.toReversed().map((question, index) => (
<div className="post-home" onDoubleClick={()=>toggleLike(question._id)}>
  <div className="post-header-home">
    <img
      src="images/user-image.jpg"
      alt="Person"
      className="person-image-home"
    />
    <div className="post-info-home">
      <h2>{question.title}</h2>
      {/* <h4>{question.body}</h4> */}
      <p className='home-posted-by'>{question.RequestBy && (<>Posted by {question.RequestBy.fullname}</>
        )} on {formatDate(question.createdAt)}</p>
    </div>
    
  </div>
  <div className="post-content-home">
  <img
      src={`${process.env.PUBLIC_URL}/uploads/${question.image}`}
      alt="Post"
      className="post-image-home"
    />
    <p>
      {/* {question.body}... */}
      <div className='like-and-count'> 
  {/* likecount is a property we made at sent it here from server side after fetching likes count */}
   <span className='counting-like'> {question.likesCount}</span>
   {

    //if in the likes json question._id exists then it is true, otherwise it is false
    likes[question._id]?      
    <>
    <IconButton 
    className={`like-button liked`}
    style={{color:'#516759'}} onClick={()=>toggleLike(question._id)}> 
    <FavoriteIcon/>
    </IconButton>
    </> :
    <>
    {/* <span className='counting-like'>{question.likes.length}</span> */}
    <IconButton 
    className={`like-button`}
    style={{color:'#516759'}} onClick={()=>toggleLike(question._id)}> 
    <FavoriteBorderIcon/>
    </IconButton>
    </>
   }
   
   </div>
           {showMore && (
        <>
          <span>
           {question.body}
        </span>
  <div className='comment-container'>
  <div className='comment-post'>
  <form onSubmit={handleSubmit} className='home-page-comment-form'>
      <input 
      type='text' 
      id="post-body"
      className='comment-input'
      placeholder='Write a comment...'
      value={body}
      onChange={handleBodyChange}
      />
      <IconButton className="button-comment-post" type="submit" 
      onClick={()=> serCurrQId(question._id)}>
      <SendIcon style={{color:'#516759'}} />
      </IconButton>
  </form>
  </div>

  {
  Array.isArray(comments) && comments.length > 0 ? (
    <>
  {comments
  .filter((comment)=>comment.qid===question._id)
  .map((comment, commentIndex) => (
  <div className='comment-block-outer'>
      <b>{comment.user} </b>
      <div className='comment-body'>
        {comment.body}
      </div>

      <div className='comment-actions'>
          <div className='comment-react-inner'>
              Like
              <i class="fa-regular fa-heart"></i>
          </div>
          <div className='comment-react-inner'>
              Edit
              <i class="fa-regular fa-pen-to-square"></i>
          </div>
      </div>
  </div>
  ))}
  </>
  ):(
    <>
    {question.answers && (
  <>
  {question.answers.map((comment, commentIndex) => (
  <div className='comment-block-outer'>
      <b> {comment.User.fullname} </b>
      <div className='comment-body'>
        {comment.body}
      </div>
      <div className='comment-actions'>
          <div className='comment-react-inner'>
              Like
              <i class="fa-regular fa-heart"></i>
          </div>
          <div className='comment-react-inner'>
              Edit
              <i class="fa-regular fa-pen-to-square"></i>
          </div>
      </div>
  </div>
  ))}
      </>
  )}
    </>
  )}
</div>
</>
)} 
  </p>
    <button className="button-home" onClick={toggleContent}>
      {showMore ? "Read Less" : "Read More"}
    </button> 
  </div>
</div>
))}
</div>
        <div className="right-sidebar-env">    
        <div className='environments'> Environments </div>
            <div className='env' onClick={triggerEnv} value='Family'> <img className='Familygroupimg' src="../images/user-image.jpg"/> <span className='g_name'> Family </span></div>
            <div className='env' onClick={triggerEnv} value='College'> <img className='Familygroupimg' src="../images/user-image.jpg"/> <span className='g_name'> College </span> </div>
            <div className='env' onClick={triggerEnv} value='Friends'> <img className='Familygroupimg' src="../images/user-image.jpg"/> <span className='g_name'> Friends </span> </div>
            <div className='env' onClick={triggerEnv} value='Other'> <img className='Familygroupimg' src="../images/user-image.jpg"/> <span className='g_name'> Other </span> </div>
            <div className='envCreate'> Create Environments + </div>
          </div>
        <div className="btn-sidebar-home">
          <Link to="/post"><button className="button-home">Add a question</button> </Link>
        </div>
        </div>
    </>
  );
}

export default Env;