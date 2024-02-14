import React,{useState} from 'react' 
import { Link } from 'react-router-dom';
import Post from '../Post/Post';
import './nav.css'

export default function Nav({onDashImageClick,loginpage}) {
  const [tog, settog] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const NavBarToggleButton = () => {
    settog(!tog) //!returns opposite boolean
  }

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div>
        {showModal && <Post closeModal={closeModal} />}

        <div className="div-navbar">
            <h3 className='name-in-logo'><a href='http://localhost:3000/'>InSeeks</a> </h3>
            <ul className='ul-navbar_center'>
                <li><img className="dashboard-image" src="/images/dashboard.png" alt="" onClick={onDashImageClick}/></li>
                {/* <Link to="/chat"> <li><img className="chatoption-image" src="/images/chatoption.png" alt=""/></li></Link> */}
                <li><i className="fa-solid fa-bell" id='thebell-icon'></i></li>
                <Link to="/profile"><li><i className="fa-solid fa-user" id='theprofile-icon'></i></li></Link>
                <li><i class="fa-solid fa-person-circle-plus" id='follow-icon'></i></li>
                <li><i class="fa-regular fa-pen-to-square" id='answer-icon'></i></li>
                <li><i class="fa-brands fa-space-awesome" id='space-icon'></i></li>
                </ul>
                      
            <ul className='ul-navbar_right'>
                <li><input className='search-text' type='text' placeholder='Search'></input></li>
                <Link to ="/"><li><button className='navbar-login-button' onClick={loginpage}> Log out </button></li> </Link>
                <li><button className='navbar-question-button' onClick={()=> {setShowModal(true)}}> Add a Question </button></li>
                <button className='toggle-button-on-nav-bar' onClick={NavBarToggleButton}> In </button>
            </ul>
            {/* For toggle Links */}            
        </div>
      <div className={`ToggleDiv${tog? 'notShowing' : ''}`}>
      <ul className='ul-navbar_top'>
                <li><img className="dashboard-image" src="/images/dashboard.png" alt="" /><a href="#">Dashboard</a></li>
                {/* <li><img className="chatoption-image" src="/images/chatoption.png" alt="" /><a href="#">Chat</a></li> */}
                <li><i class="fa-solid fa-bell" id='thebell-icon'></i><a href="#">Notification</a></li>
                <Link to ="/profile"><li><i class="fa-solid fa-user" id='theprofile-icon'></i><a href="#">Profile</a></li></Link>
                </ul>

            <ul className='ul-navbar_bottom'>
                <li><input className='search-text-toggle-bottom' type='text' placeholder='Search'></input></li>
                <Link to ="/"><li><button className='navbar-login-button-toggle-bottom' onClick={loginpage}> Log out </button></li> </Link>
            </ul>
      </div>
    </div>
  )
}