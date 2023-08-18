export default function Navbar(){
    return(
        <nav className='nav'>
            <a href='/' className='site-title'>Michael Verdon</a>
                <ul>    
                    <li>
                        <a href='/projects'>Projects</a>
                    </li>
                    <li>
                        <a href='/skills'>Skills</a>
                    </li>
                    <li>
                        <a href='/contact'>Contact</a>
                    </li>
                </ul>
        </nav>
    )
}