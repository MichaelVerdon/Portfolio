import Selfie from "./images/selfielinkedin.jpg"
import gitHubLogo from "./images/github.svg"
import './pages.css'
import React, { useEffect } from 'react';

export default function Home(){

    const RedirectGithub = () => {
        window.open("https://github.com/MichaelVerdon")
    }

    return(
        <div className="homeContainer">
            <h1>Hello 👋, my name is Michael</h1>
            <div className="avatar">
                <img src={Selfie} className="selfie"></img>
            </div>
            <div className="textContainer">
                <p>
                I am a Junior software engineer for Invertase. Furthermore, I also hold an MEng in Computer Science with Distinction from the University of Portsmouth and graduated from Maker's Academy. I'm passionate about software development, artificial intelligence, and creative technology, and I thrive on creating innovative solutions and pushing the boundaries of what's possible.
                </p>
            </div>
            <div className="githubCont">
                <img src={gitHubLogo} alt="github" id="github" onClick={RedirectGithub}/>
                <p>Github</p>
            </div>       
        </div>
    )
}