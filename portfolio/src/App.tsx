import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Skills from './pages/Skills';
import logo from './assets/Michael-Logotype-03.png';

export default function App() {
  return (
    <div className="App">
      <Navbar logo={logo} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  );
}
