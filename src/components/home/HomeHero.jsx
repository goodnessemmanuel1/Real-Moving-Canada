import { Link } from 'react-router-dom';
import Kicker from '../common/Kicker.jsx';
import Button from '../common/Button.jsx';
import Icon from '../common/Icon.jsx';
import { MapleLeaf } from '../common/LogoMark.jsx';
import { COMPANY } from '../../constants/company.js';
import heroImage from '../../assets/images/hero-rmc.webp';
import heroImageLarge from '../../assets/images/hero-rmc-2880.webp';
import heroMobile from '../../assets/images/hero-rmc-mobile.webp';
import heroMobileLarge from '../../assets/images/hero-rmc-mobile@2x.webp';

const HERO_SERVICES = [['Residential', 'Commercial', 'Packing & Unpacking'], ['Junk Removal', 'Secure Storage']];

/** Hero from the RMC brand mock-up: full-width photo, copy over the skyline. */
export default function HomeHero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-media">
        <picture>
          {/* Phones get a tall crop: sky above, truck and crew below, so the photo sits behind the text. */}
          <source media="(max-width: 600px)" srcSet={`${heroMobile} 780w, ${heroMobileLarge} 1170w`} sizes="100vw" />
          <img src={heroImage} srcSet={`${heroImage} 1600w, ${heroImageLarge} 2880w`} sizes="100vw" alt="Real Moving Canada movers carrying boxes from an RMC truck to a family’s new home" width="1600" height="585" fetchpriority="high" />
        </picture>
      </div>
      <div className="wrap wrap-wide hero-grid">
        <div className="hero-inner">
          <Kicker>{COMPANY.motto}</Kicker>
          <h1 id="hero-title">Professional Moving Services Across Canada</h1>
          <div className="hero-services" aria-label="Services">
            {HERO_SERVICES.map((row) => (
              <ul key={row[0]}>{row.map((s) => <li key={s}>{s}</li>)}</ul>
            ))}
          </div>
          <div className="actions">
            <Button to="/quote" size="lg" iconRight="arrow-right">Get a Free Quote</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

const STRIP = [
  { slug: 'residential', icon: 'home', label: 'Residential Moving' },
  { slug: 'commercial-office', icon: 'building', label: 'Commercial Moving' },
  { slug: 'packing-unpacking', icon: 'box', label: 'Packing & Unpacking' },
  { slug: 'junk-removal', icon: 'truck', label: 'Junk Removal' },
  { slug: 'storage', icon: 'warehouse', label: 'Storage Solutions' },
];

/** The row of service icons under the hero. */
export function HeroServiceStrip() {
  return (
    <nav className="service-strip" aria-label="Our main services">
      <ul className="wrap">
        {STRIP.map((s) => (
          <li key={s.slug}>
            <Link to={`/services/${s.slug}`}><Icon name={s.icon} /><span>{s.label}</span></Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Trust line: Trusted | Insured | Professional · Proudly serving Canada · Saskatoon, SK. */
export function TrustBar() {
  return (
    <div className="trust-bar">
      <div className="wrap wrap-wide trust-bar-inner">
        <p><Icon name="shield" /><span>Trusted <i aria-hidden="true">|</i> Insured <i aria-hidden="true">|</i> Professional</span></p>
        <p className="trust-center"><MapleLeaf className="trust-leaf" /><span>Proudly Serving Communities Across Canada</span></p>
        <p><Icon name="pin" /><span>{COMPANY.address.city}, {COMPANY.address.provinceCode}</span></p>
      </div>
    </div>
  );
}
