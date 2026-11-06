import { Navigate, Route, Routes } from 'react-router-dom';
import logo from './assets/Michael-Logotype-03.png';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import StyleGuide from './pages/StyleGuide';

/** The old separate pages now live as sections of the home page. */
const legacyRoutes = ['projects', 'skills', 'contact'];

export default function App() {
  return (
    <>
      <Navbar logo={logo} />
      <Routes>
        <Route path="/" element={<Home />} />
        {legacyRoutes.map((section) => (
          <Route
            key={section}
            path={`/${section}`}
            element={<Navigate to={{ pathname: '/', hash: `#${section}` }} replace />}
          />
        ))}
        <Route path="/style-guide" element={<StyleGuide />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}
