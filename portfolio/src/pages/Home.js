import Selfie from "./images/onyo.jpg"
import './pages.css'

export default function Home(){
    return(
        <>
        <h1>Hello, my name is Michael</h1>
        <div className="avatar">
            <img src={Selfie} className="selfie"></img>
        </div>
        </>
    )
}