import { session } from '../lib/session';
import { useScrollReveal } from '../hooks/useScrollReveal';
import '../styles/parallax.css';
import { HomeHeader } from '../components/home/HomeHeader';
import { HomeHero } from '../components/home/HomeHero';
import { HomeFeatures } from '../components/home/HomeFeatures';
import { HomeHowItWorks } from '../components/home/HomeHowItWorks';
import { HomePrinciples } from '../components/home/HomePrinciples';
import { HomeFaq } from '../components/home/HomeFaq';
import { HomeSecurity } from '../components/home/HomeSecurity';
import { HomeCallToAction } from '../components/home/HomeCallToAction';
import { HomeFooter } from '../components/home/HomeFooter';

export function Home() {
  const isLogged = session.isAuthenticated();
  const rootRef = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={rootRef} className="min-h-screen overflow-x-clip bg-canvas text-foreground flex flex-col font-sans selection:bg-accent/20 selection:text-foreground transition-colors duration-200">
      <HomeHeader isLogged={isLogged} />
      <main className="flex-1">
        <HomeHero isLogged={isLogged} />
        <HomeFeatures isLogged={isLogged} />
        <HomeHowItWorks />
        <HomePrinciples />
        <HomeFaq />
        <HomeSecurity />
        <HomeCallToAction isLogged={isLogged} />
      </main>
      <HomeFooter isLogged={isLogged} />
    </div>
  );
}
