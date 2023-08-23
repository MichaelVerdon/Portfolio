import Navbar from './Navbar';
import './App.css';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Skills from './pages/Skills';
import Contact from './pages/Contact';
import { Route, Routes } from "react-router-dom";
import Logo from './pages/images/Michael-Logotype-03.png'

function App() {
  return (
    <div className="App">
      <Navbar Logo={Logo}/>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/projects" element={<Projects />}></Route>
          <Route path="/skills" element={<Skills />}></Route>
          <Route path="/contact" element={<Contact />}></Route>
        </Routes>
    </div>
  );
}

export default App;
