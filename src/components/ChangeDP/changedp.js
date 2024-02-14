import React, { useState, useEffect} from 'react';
import HashLoader from "react-spinners/HashLoader";
import {Routes, Route, useNavigate, Link} from 'react-router-dom';
import axios from 'axios';

import './changedp.css';

const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};
export default function Post(props){

  
  const url = "localhost";
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageId, setImageId] = useState(null);


  const userInitial = {}; // Initialize user as null

  // Inside your component
  const [uid, setUid] = useState(null); // Initialize uid as null
  const [userr, setUser] = useState(userInitial);
  //localhost
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
      setImageId(json.image);
  }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  } 


  useEffect( () => {
    fetchData();
}, []);


  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
    const fileInput = event.target;
    const fileNameDisplay = document.getElementById('file-name');
  
    if (fileInput.files.length > 0) {
      const fileName = fileInput.files[0].name;
      fileNameDisplay.textContent = fileName;
    } else {
      fileNameDisplay.textContent = '';
    }
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('uid',userr.id);
    if (image) {
      formData.append('image', image);
    }
    try {
      setLoading(true);
      const response = await axios.post(
        `http://${url}:5000/api/post/saveuserimage`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      if (response.status === 200) {
        setImageId(response.data);
        navigate(`/profile`);
        console.log("navigating")
      }
    } catch (err) {
      console.log(err.response);
    } finally {
      setLoading(false);
      props.closeModal();
    }
  };
    return(
        <>

        <div className='question-submit-image'>
        <div className="choose-image">
            <div class="choose-image-tag"><h4 className="post-heading-post">Attach an image file</h4></div>
            <div class="choose-image-tag2"><i class="fa-solid fa-x" onClick={props.closeModal}></i></div>
        </div>
        <form className="form-post-image" 
        onSubmit={handleSubmit} 
        encType='multipart/form-data'>
    <div>
      <label htmlFor="image-post" className='btn-file-upload'>
        <span> <i class="fa-solid fa-paperclip fa-5x"></i> 
        </span>
      </label>
      <input
        type="file"
        name="image"
        id="image-post"
        accept="image/*"
        onChange={handleImageChange}
        style={{display: 'none'}}
      />
        <span id="file-name"></span> {/* This span will display the selected file name */}
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
      <button className="button-post-img" type="submit"> Add the image</button>
      {/* </Link> */}
  </form>
        </div>
        </>
    )
}