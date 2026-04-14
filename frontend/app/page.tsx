import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, ChevronRight } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.navBrand}>
          <div className={styles.logoIcon} />
          <span className={styles.logoText}>RealEstateAI</span>
        </div>
        <div className={styles.navLinks}>
          <Link href="/login" className={styles.loginButton}>
            Log In
          </Link>
          <Link href="/signup" className={styles.signupButton}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.pill}>
            <span className={styles.pillBadge}>New</span>
            <span>Mortgage Copilot 2.0 is live</span>
            <ChevronRight size={16} />
          </div>
          
          <h1 className={styles.headline}>
            Intelligent mortgage <br/>
            <span className={styles.highlight}>underwriting at scale</span>
          </h1>
          
          <p className={styles.subtitle}>
            Transform your lending operations with deterministic AI. 
            Automate document processing, perform complex sensitivity analysis, 
            and make lightning-fast decisions with zero hallucinations.
          </p>

          <div className={styles.buttonGroup}>
            <Link href="/login" className={styles.primaryCta}>
              Enter Platform <ArrowRight size={20} />
            </Link>
            <a href="#features" className={styles.secondaryCta}>
              See how it works
            </a>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <ShieldCheck size={24} className={styles.statIcon} />
              <div className={styles.statText}>
                <strong>Deterministic</strong>
                <span>Bank-grade security</span>
              </div>
            </div>
            <div className={styles.statItem}>
              <Zap size={24} className={styles.statIcon} />
              <div className={styles.statText}>
                <strong>Sub-second</strong>
                <span>Processing time</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Abstract Background Decoration */}
        <div className={styles.glowDecoration}></div>
      </main>
    </div>
  );
}
