import React from 'react';
import './App.css';

const Navbar = ({ Logo }) => {

    return(
        <nav className='nav'>
            <a href='/'>
                <img src={Logo}/>
            </a>
                <ul className='navList'>    
                    <li>
                        <a href='/projects' className="header">Projects</a>
                    </li>
                    <li>
                        |
                    </li>
                    <li>
                        <a href='/skills' className="header">Skills</a>
                    </li>
                    <li>
                        |
                    </li>
                    <li>
                        <a href='/contact' className="header">Contact</a>
                    </li>
                </ul>
        </nav>
    )
}

export default Navbar