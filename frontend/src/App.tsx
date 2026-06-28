import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Layout } from './components/Layout';
import { AnimatedPage } from './components/AnimatedPage';
import { Home } from './pages/Home';
import { PartyCreate } from './pages/PartyCreate';
import { PartyRoom } from './pages/PartyRoom';
import { PartyGame } from './pages/PartyGame';
import { PartyResults } from './pages/PartyResults';
import { AsyncHome } from './pages/AsyncHome';
import { SoloGame } from './pages/SoloGame';
import { ChallengeGame } from './pages/ChallengeGame';
import { DailyGame } from './pages/DailyGame';

export default function App() {
  const location = useLocation();

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <AnimatedPage key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/party/create" element={<PartyCreate />} />
            <Route path="/party/:code" element={<PartyRoom />} />
            <Route path="/party/:code/play" element={<PartyGame />} />
            <Route path="/party/:code/results" element={<PartyResults />} />
            <Route path="/async" element={<AsyncHome />} />
            <Route path="/async/play" element={<SoloGame />} />
            <Route path="/challenge/:code" element={<ChallengeGame />} />
            <Route path="/daily/:difficulty" element={<DailyGame />} />
          </Routes>
        </AnimatedPage>
      </AnimatePresence>
    </Layout>
  );
}
