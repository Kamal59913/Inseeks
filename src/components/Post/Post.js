import React, { useState, useEffect} from 'react';
import HashLoader from "react-spinners/HashLoader";
import {Routes, Route, useNavigate, Link} from 'react-router-dom';
import axios from 'axios';

import './Post.css';

const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};
//http://localhost:5000/api/login
export default function Post(props){

  
  const url = "localhost";
  let urlToUpload; 
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  let [color, setColor] = useState("#ffffff");
  const [showModal, setShowModal] = useState(false);


  const userInitial = {}; // Initialize user as null

  // Inside your component
  const [uid, setUid] = useState(null); // Initialize uid as null
  const [userr, setUser] = useState(userInitial);

  //localhost

  useEffect( () => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://${url}:5000/api/getuser`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "auth-token": localStorage.getItem('token')
          },
      });
      if (response.ok) {
        const json = await response.json();
        console.log(json);
        setUser(json);
        setUid(json.id);
    }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
        }
       
        fetchData();
}, []);


 const uploadFile = async () => {
  const formData = new FormData();
  try {
    if (image) {
      formData.append('image', image);// Inaffective approach since multiple images might have the same name.
    }
      const response = await axios.put(urlToUpload, image, { headers: { "Content-Type": "application/json",} });
      console.log("Success file has been uploaded", response)
      return response.data;
  } catch (error) {
      console.log('Error while calling the API ', error);
  }
}

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleBodyChange = (event) => {
    setBody(event.target.value);
  };

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

 
  const handleSubmit = async (e) => {
    // e.preventDefault();
    const formData = new FormData();
    formData.append('title',title);
    formData.append('body',body);
    formData.append('uid',uid);
    
    if (image) {
      formData.append('image', image);// Inaffective approach since multiple images might have the same name.
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `http://${url}:5000/post/questionrequest`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      if (response.status === 200) {
        console.log(response);
        urlToUpload = response.imageUploadingUrl;
        uploadFile();
        console.log("navigating")
      }
    } catch (err) {
      console.log(err.response);
    } finally {
      setLoading(false);
      props.closeModal();
      navigate('/');
    }
  };
    return(
        <div className='question-submit'>
        <div className="upper-post">
            <div class="upper-tag"><h4 className="post-heading-post">Write a question ...</h4></div>
            <div class="upper-tag2"><i class="fa-solid fa-x" onClick={props.closeModal}></i></div>
        </div>
        <form className="form-post" 
        onSubmit={handleSubmit} 
        encType='multipart/form-data'>
    <div>
      <label htmlFor="title-post">Post Title:</label>
      <input
        type="text"
        id="title-post"
        value={title}
        onChange={handleTitleChange}
      />
    </div>
    <div>
      <label htmlFor="body-post">Post Body:</label>
      <textarea
        id="body-post"
        value={body}
        onChange={handleBodyChange}
        // required
        rows={6}
      />
    </div>
    <div>
      <label htmlFor="image-post">Image:</label>
      <input
        type="file"
        name="image"
        id="image-post"
        accept="image/*"
        onChange={handleImageChange}
      />
    </div>
    {loading && 

<HashLoader 
color="#799a84"
loading={loading}
cssOverride={override}
size={60}
aria-label="Loading Spinner"
data-testid="loader"
/> 
    } {/* Show loading indicator */}
      <button className="button-post" type="submit">Submit</button>
      {/* </Link> */}
  </form>
        </div>
    )
}