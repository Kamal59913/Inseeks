  import React, { useState, useEffect } from 'react';
  import axios from 'axios';
  import { Link, useNavigate } from 'react-router-dom';
  import InterestsPopup from './Interest';
  import QUESTION from '../HomePageComponents/questionList'
  import "./home.css";
  import "./Comments.css"
import Post from '../Post/Post';

  function Home(props) {

  const navigate = useNavigate();
  const url = "localhost";
  const [env, setEnv] = useState('null')
  const [showModal, setShowModal] = useState(false);

const [showPopup, setShowPopup] = useState(false);
const [rightSidebarInterests, setRightSidebarInterests] = useState([]);
const addInterestToSidebar = (interests) => {
  setRightSidebarInterests([...rightSidebarInterests, ...interests]);
};
const openPopup = () => {
  setShowPopup(true);
};
const closePopup = () => {
  setShowPopup(false);
};

const closeModal = () => {
  setShowModal(false);
};

const triggerEnv = async (event) =>{
  const selectedValue = event.currentTarget.getAttribute('value');
  console.log(selectedValue);

  await axios.get(`http://${url}:5000/home/${selectedValue}`) // Replace with your API endpoint for fetching comments
  .then((response)=>{
    if(response.status == 200) {
      setEnv(selectedValue)
      // navigate(`/env/${selectedValue}`, { state: selectedValue })
    }
  }).catch((err)=>{
      console.log(err)
  })
}
    return (
      <>
        {showModal && <Post closeModal={closeModal} />}
        <div className={`container-home  ${showModal ? 'modal-open':''}`}>
          <div className={`left-sidebar-home ${showModal ? 'modal-open':''}`}>
{env == 'null' ? (<>
  <h2>Interests</h2>
            <ul>
              {rightSidebarInterests.map((interest, index) => (
                <li key={index}>{interest}</li>
              ))}
            </ul>
            <button className="button-home" onClick={openPopup}>Add Interests</button>
            {showPopup && (
              <InterestsPopup onClose={closePopup} addInterest={addInterestToSidebar} />
    )}</>):(<>
  {env}
</>)}

          </div>
          <QUESTION/>
          <div className={`right-sidebar-home`}>    
          <div className='environments'> Environments </div>
            <div className='env' onClick={triggerEnv} value='Family'> <img className='Familygroupimg' src="images/user-image.jpg"/> <span className='g_name'> Family </span></div>
            <div className='env' onClick={triggerEnv} value='College'> <img className='Familygroupimg' src="images/user-image.jpg"/> <span className='g_name'> College </span> </div>
            <div className='env' onClick={triggerEnv} value='Friends'> <img className='Familygroupimg' src="images/user-image.jpg"/> <span className='g_name'> Friends </span> </div>
            <div className='env' onClick={triggerEnv} value='Other'> <img className='Familygroupimg' src="images/user-image.jpg"/> <span className='g_name'> Other </span> </div>
            <div className='envCreate'> Create Environments + </div>
          </div>
          <div className="btn-sidebar-home">
          </div>
          </div>
      </>
    );
  }

  export default Home;