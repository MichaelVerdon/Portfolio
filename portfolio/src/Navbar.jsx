import React from 'react';
import './App.css';

const Navbar = ({ Logo }) => {

    return(
        <nav className='nav'>
            <div className='logoContainer'>
                <a href='/'>
                    <img src={Logo}/>
                </a>
            </div>
            <div className='navContentsContainer'>
                <ul className='navList'>    
                    <li>
                        <a href='/projects' className="header">Projects</a>
                    </li>
                    <li>
                        <a href='/skills' className="header">Skills</a>
                    </li>
                    <li>
                        <a href='/contact' className="header">Contact</a>
                    </li>
                </ul>
            </div>
        </nav>
    )
}

export default Navbar