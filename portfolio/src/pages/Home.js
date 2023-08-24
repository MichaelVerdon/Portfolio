import Selfie from "./images/onyo.jpg"
import gitHubLogo from "./images/github.svg"
import './pages.css'
import React, { useEffect } from 'react';

export default function Home(){

    const RedirectGithub = () => {
        window.open("https://github.com/MichaelVerdon")
    }

    return(
        <>
            <h1>Hello 👋, my name is Michael</h1>
            <div className="avatar">
                <img src={Selfie} className="selfie"></img>
            </div>
            <div className="textContainer">
                <p>
                    I am a fourth year MEng Computer Science student 
                    attending the University of Portsmouth with a passion for software
                    development, artificial intelligence and creative technology.
                </p>
            </div>
            <div className="githubCont">
                <img src={gitHubLogo} alt="github" id="github" onClick={RedirectGithub}/>
                <p>Github</p>
            </div>       
        </>
    )
}