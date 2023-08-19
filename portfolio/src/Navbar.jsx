import React from 'react';

const Navbar = () => {

    return(
        <nav className='nav'>
            <a href='/' className='site-title'>Michael Verdon</a>
                <ul>    
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