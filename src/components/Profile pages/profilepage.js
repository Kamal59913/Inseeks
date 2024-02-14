  import React,{useState, useEffect, useContext} from 'react'
  import axios from "axios"
  import { Link } from 'react-router-dom';
  import CHANGEDP from '../ChangeDP/changedp'
  import { useLocation } from 'react-router-dom';

 
  


  export default function Profilepage({props}) {

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const imageId = queryParams.get('imageId');
    const url = "localhost"
  //localhost
  const userInitial = {}; // Initialize user as null

  const [userr, setUser] = useState(userInitial);
  const [changeImage, setChangeImage] = useState('none');
  const [showImgUpload, setshowImgUpload] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const fetchData = async () => {
    const response = await fetch(`http://${url}:5000/api/getuser`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem('token')
        },
    });
    if (response.ok) {
      const json = await response.json();
      setUser(json);
  }
}

const fetchImageUrl = async () => {
  const formData = new FormData();
  const data = {uid: userr.id}
  console.log(data.uid)
  formData.append('uid',userr.id);
  try {
    const response = await axios.post(
      `http://${url}:5000/api/getuserimg`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
      );
    if (response.status === 200) {
      console.log(response.data);
      setImageUrl(response.data);
    }
  } catch (err) {
    console.log(err.response);
  }
};

useEffect( () => {
  fetchData();
}, []);

const closeModalFunction = () => {
  fetchImageUrl();
  setshowImgUpload(false);
}

  return (  
    <>
    {showImgUpload &&  <CHANGEDP closeModal= {closeModalFunction}/>}
      <div className='profile-page'>
      <div className='user-image-and-name-part'>
              <div className='image-part' onMouseEnter={()=> setChangeImage('block')} onMouseLeave={()=> setChangeImage('none')}>
              {imageUrl ? (
    <img
        src={imageUrl}
        className='user-image'
    />
) : (
    <img
        src='/uploads/5856.jpg'
        className='user-image'
        alt="Profile Placeholder" // Alt text for placeholder image
    />
)}

              <div className='change-image' style={{display:changeImage}} onClick={()=>{setshowImgUpload(true)}}> 
              <span className='change-image-content'><i class="fa-solid fa-camera-retro"></i> Change Image</span>
              </div>
              </div>
          <div className="users-name">
              <h1> {userr.name} </h1>
              <h3> PMO | Admin </h3>
          </div>
      </div>
          <div className="container-for-grid">

      <div className="add-user">
        Add user
      </div>
      <div className="add-user">
        Remove user
      </div>
      <div className="add-user">
        View users
      </div>
      <Link to="/requests">
      <div className="add-user4">
          <p>List of questions</p>
      </div>
      </Link>

      <div className="add-user">
        See message requests
      </div>
      <div className="add-user">
        Manage interest
      </div>
      </div>
      </div>
      </>
    )
  }
