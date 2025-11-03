import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Trends from './pages/Trends';
import Offers from './pages/Offers';
import Factory from './pages/Factory';
import Publisher from './pages/Publisher';
import Analytics from './pages/Analytics';
import Redirect from './pages/Redirect';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/go/:slug" element={<Redirect />} />
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/trends" element={<Trends />} />
                <Route path="/offers" element={<Offers />} />
                <Route path="/factory" element={<Factory />} />
                <Route path="/publisher" element={<Publisher />} />
                <Route path="/analytics" element={<Analytics />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
