import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import GameDetail from './pages/GameDetail';
import Cart from './pages/Cart';
import Integrantes from './pages/Integrantes';
import { TransitionProvider } from './transitions/TransitionContext';
import TransitionManager from './transitions/TransitionManager';

function App() {
  return (
    <Router>
      <TransitionProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 pt-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/jogo/:id" element={<GameDetail />} />
              <Route path="/carrinho" element={<Cart />} />
              <Route path="/integrantes" element={<Integrantes />} />
            </Routes>
          </main>
          <Footer />
          <TransitionManager />
        </div>
      </TransitionProvider>
    </Router>
  );
}

export default App;
