"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const divisions = [
  ["01", "Patrol Division", "Frontline response · Community safety", "/department-logos/patrol-division.webp"],
  ["02", "Special Operations", "High-risk operations · Tactical response", "/department-logos/special-operations-bureau.webp"],
  ["03", "Criminal Investigations", "Case development · Major crimes", "/department-logos/criminal-investigations-division.webp"],
  ["04", "Air Support", "Aerial observation · Operational support", "/department-logos/air-support-division.webp"],
  ["05", "Internal Affairs", "Integrity · Professional standards", "/department-logos/internal-affairs-division.webp"],
  ["06", "Gang & Narcotics", "Organized crime · Narcotics enforcement", "/department-logos/gang-narcotics-division.webp"],
];

export default function PublicHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [clock, setClock] = useState("--:--:--");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const tick = () => setClock(new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date()));
    tick(); const timer = window.setInterval(tick, 1000);
    const onScroll = () => setScroll(Math.min(100, (window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)) * 100));
    window.addEventListener("scroll", onScroll, { passive: true });
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => { window.clearInterval(timer); window.removeEventListener("scroll", onScroll); observer.disconnect(); };
  }, []);

  const closeMenu = () => setMenuOpen(false);
  return <main id="top" className="lspd-site">
    <div className="scroll-progress" style={{ width: `${scroll}%` }} />
    <header className="site-header">
      <Link href="/" className="site-brand" onClick={closeMenu}>
        <span className="brand-crest"><Image src="/lspd-badge.webp" alt="LSPD badge" width={54} height={54} priority /></span>
        <span className="brand-copy"><b>LOS SANTOS</b><small>POLICE DEPARTMENT</small></span>
      </Link>
      <nav className={menuOpen ? "site-nav open" : "site-nav"}>
        <a href="#mission" onClick={closeMenu}>THE DEPARTMENT</a><a href="#divisions" onClick={closeMenu}>DIVISIONS</a><a href="#standards" onClick={closeMenu}>OUR STANDARD</a><a href="#recruitment" onClick={closeMenu}>RECRUITMENT</a>
      </nav>
      <div className="header-right"><span className="local-clock"><i /> LS {clock}</span><Link href="/login" className="access-link">OFFICER ACCESS <span>↗</span></Link></div>
      <button className="menu-toggle" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
    </header>

    <section className="cinema-hero">
      <video className="hero-video" autoPlay muted loop playsInline poster="/lspd-hero-rockstar-final.webp">
        <source src="https://preview.wbm.im/pw/medium/aeaa94cc7d5da33fe94d4e18188480cb.mp4" type="video/mp4" />
      </video>
      <div className="hero-video-fallback" />
      <div className="hero-vignette" />
      <div className="hero-gridline" />
      <div className="hero-inner">
        <div className="hero-status reveal"><span className="status-pulse" /> OFFICIAL DEPARTMENT PORTAL <span className="status-rule" /> SAN ANDREAS · EST. 18—</div>
        <div className="hero-main-copy">
          <p className="hero-pretitle reveal">TO SERVE. TO PROTECT. TO LEAD.</p>
          <h1 className="reveal">THE CITY<br /><em>NEVER</em> STANDS<br />STILL<span className="hero-period">.</span></h1>
          <p className="hero-description reveal">Every call matters. Every decision counts. The Los Santos Police Department stands committed to protecting life, preserving peace, and serving every neighborhood.</p>
          <div className="hero-buttons reveal"><a href="#mission" className="button-solid">DISCOVER THE DEPARTMENT <span>↓</span></a><Link href="/login" className="button-outline"><span className="button-play">↗</span> SECURE OFFICER LOGIN</Link></div>
        </div>
        <div className="hero-bottom reveal"><div className="hero-coordinates"><span>34°03' N</span><span>118°14' W</span><span>LOS SANTOS, SA</span></div><div className="hero-scroll"><span>SCROLL TO EXPLORE</span><i /></div><div className="hero-index">01 <span>/</span> 04</div></div>
      </div>
      <div className="hero-side-stamp">LSPD <span>·</span> PUBLIC SAFETY</div>
    </section>

    <section className="signal-strip"><div className="signal-label"><span className="status-pulse" /> DEPARTMENT PRIORITIES</div><div className="signal-items"><span>COMMUNITY FIRST</span><b>✳</b><span>ACCOUNTABILITY</span><b>✳</b><span>PROFESSIONAL SERVICE</span><b>✳</b><span>PUBLIC TRUST</span></div><div className="signal-time">LOCAL TIME <strong>{clock}</strong></div></section>

    <section id="mission" className="mission-section">
      <div className="section-topline reveal"><span>01 / WHO WE ARE</span><span>LOS SANTOS POLICE DEPARTMENT</span></div>
      <div className="mission-layout">
        <div className="mission-title reveal"><p className="micro-label">A DEPARTMENT BUILT FOR THE CITY</p><h2>MORE THAN<br />A <em>BADGE.</em></h2><div className="mission-seal"><Image src="/lspd-badge.webp" alt="Department seal" width={126} height={126} /></div></div>
        <div className="mission-copy reveal"><span className="giant-quote">“</span><p className="mission-lead">Our responsibility is not simply to enforce the law. It is to earn the trust that makes a safer city possible.</p><p className="mission-body">The Los Santos Police Department is dedicated to fair, transparent, and professional law enforcement. Through service, discipline, and accountability, our officers work every day to protect the people and communities of Los Santos.</p><a href="#standards" className="text-link">OUR MISSION & VALUES <span>↗</span></a></div>
      </div>
      <div className="metric-row reveal"><div><strong>24<span>/7</span></strong><small>DEDICATED SERVICE</small></div><div><strong>01</strong><small>MISSION · PUBLIC SAFETY</small></div><div><strong>100<span>%</span></strong><small>COMMITMENT TO THE CITY</small></div><div className="metric-note">ONE CITY.<br /><em>ONE STANDARD.</em></div></div>
    </section>

    <section id="divisions" className="division-section">
      <div className="section-topline reveal"><span>02 / ORGANIZATION</span><span>BUILT TO RESPOND</span></div>
      <div className="division-heading reveal"><div><p className="micro-label">SPECIALIZED. UNITED. READY.</p><h2>ONE DEPARTMENT.<br /><em>MANY MISSIONS.</em></h2></div><p>Specialized divisions working together to deliver coordinated, professional service across Los Santos.</p></div>
      <div className="division-grid">{divisions.map(([num, name, desc, logo]) => <article className="division-card reveal" key={num}><div className="division-card-top"><span>{num} / DIVISION</span><span className="division-arrow">↗</span></div><div className="division-emblem"><Image src={logo} alt={`${name} emblem`} width={88} height={88} /></div><h3>{name}</h3><p>{desc}</p><div className="division-card-line" /></article>)}</div>
      <div className="division-foot"><span>+ ADDITIONAL BUREAUS & SPECIALIZED UNITS</span><span>VIEW ORGANIZATIONAL STRUCTURE ↗</span></div>
    </section>

    <section id="standards" className="standards-section">
      <div className="standards-image"><div className="standards-image-shade" /><div className="standards-image-caption"><span>PROFESSIONALISM IN EVERY RESPONSE</span><b>LOS SANTOS · SAN ANDREAS</b></div></div>
      <div className="standards-content"><p className="micro-label reveal">03 / OUR STANDARD</p><h2 className="reveal">TRUST IS<br />EARNED.<br /><em>EVERY DAY.</em></h2><p className="standards-intro reveal">The badge carries authority. Our actions give it meaning.</p>
        <div className="standard-list">{["Integrity without compromise", "Respect for every individual", "Accountability at every level", "Excellence in public service"].map((item, i) => <div className="standard-item reveal" key={item}><span>0{i + 1}</span><b>{item}</b><i>↗</i></div>)}</div>
      </div>
    </section>

    <section id="recruitment" className="recruit-section">
      <div className="recruit-bg-mark">LSPD</div><div className="recruit-content reveal"><p className="micro-label">04 / RECRUITMENT</p><h2>YOUR CITY.<br /><em>YOUR CALL.</em></h2><p>Step forward. Serve with purpose. Become part of a department committed to something bigger than itself.</p><div className="recruit-actions"><Link href="/login" className="button-solid">ENTER DEPARTMENT PORTAL <span>↗</span></Link><span className="recruit-note">APPLICATIONS & ANNOUNCEMENTS<br />AVAILABLE THROUGH THE OFFICER PORTAL</span></div></div><div className="recruit-seal"><Image src="/lspd-badge.webp" alt="LSPD badge" width={260} height={260} /></div>
    </section>

    <section className="faq-section"><div className="faq-heading reveal"><p className="micro-label">QUICK INFORMATION</p><h2>GOOD TO <em>KNOW.</em></h2></div><div className="faq-list">{[{q:"How do I access the officer portal?",a:"Select Officer Access in the navigation and sign in using your authorized Discord account. Access to internal tools depends on your assigned department role."},{q:"Where can I find recruitment announcements?",a:"Recruitment notices, application windows, and department updates are published through the official department portal."},{q:"Who can access internal department information?",a:"Internal information is restricted to authenticated personnel. Menu visibility and actions are controlled by department permissions."}].map((item,i)=><div className={`faq-item reveal ${activeFaq===i?"active":""}`} key={item.q}><button onClick={()=>setActiveFaq(activeFaq===i?null:i)}><span>0{i+1}</span><b>{item.q}</b><i>{activeFaq===i?"−":"+"}</i></button>{activeFaq===i&&<p>{item.a}</p>}</div>)}</div></section>

    <footer className="site-footer"><div className="footer-main"><Link href="/" className="site-brand"><span className="brand-crest"><Image src="/lspd-badge.webp" alt="LSPD badge" width={54} height={54} /></span><span className="brand-copy"><b>LOS SANTOS</b><small>POLICE DEPARTMENT</small></span></Link><p>DEDICATED TO SERVICE.<br />COMMITTED TO LOS SANTOS.</p><Link href="/login" className="footer-access">OFFICER ACCESS ↗</Link></div><div className="footer-bottom"><span>© LSPD · LOS SANTOS, SAN ANDREAS</span><span>PUBLIC INFORMATION PORTAL</span><a href="#top" onClick={(e)=>{e.preventDefault();window.scrollTo({top:0,behavior:"smooth"})}}>BACK TO TOP ↑</a></div><small className="media-credit">Hero footage: Pikwizard free stock preview.</small></footer>
  </main>;
}
