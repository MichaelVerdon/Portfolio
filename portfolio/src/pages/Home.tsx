import gitHubLogo from '../assets/github.svg';
import selfie from '../assets/selfielinkedin.jpg';

export default function Home() {
  return (
    <div className="homeContainer">
      <h1>Hello 👋, my name is Michael</h1>
      <div className="avatar">
        <img src={selfie} className="selfie" alt="Michael Verdon" />
      </div>
      <div className="textContainer">
        <p>
          I am a Junior software engineer for Invertase. Furthermore, I also hold an MEng in
          Computer Science with Distinction from the University of Portsmouth and graduated from
          Maker's Academy. I'm passionate about software development, artificial intelligence, and
          creative technology, and I thrive on creating innovative solutions and pushing the
          boundaries of what's possible.
        </p>
      </div>
      <div className="githubCont">
        <img
          src={gitHubLogo}
          alt="GitHub"
          id="github"
          onClick={() => window.open('https://github.com/MichaelVerdon')}
        />
        <p>Github</p>
      </div>
    </div>
  );
}
