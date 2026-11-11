import HomeHero, { HeroServiceStrip, TrustBar } from '../../components/home/HomeHero.jsx';
import RouteTicket from '../../components/home/RouteTicket.jsx';
import Kicker from '../../components/common/Kicker.jsx';
import Icon from '../../components/common/Icon.jsx';
import WhyChoose from '../../components/home/WhyChoose.jsx';
import ProcessSteps from '../../components/home/ProcessSteps.jsx';
import ServiceAreasPanel from '../../components/home/ServiceAreasPanel.jsx';
import HomeReviewForm from '../../components/home/HomeReviewForm.jsx';
import HomeFaq from '../../components/home/HomeFaq.jsx';
import SectionHeader from '../../components/common/SectionHeader.jsx';
import Button from '../../components/common/Button.jsx';
import ServiceGrid from '../../components/services/ServiceGrid.jsx';
import { SERVICE_BY_SLUG, FEATURED_SERVICE_SLUGS } from '../../constants/services.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { keywordsFor, businessJsonLd, faqJsonLd } from '../../constants/seo.js';
import { HOME_FAQ } from '../../components/home/HomeFaq.jsx';

const featured = FEATURED_SERVICE_SLUGS.map((slug) => SERVICE_BY_SLUG[slug]);

export default function HomePage() {
  useDocumentTitle(null, 'Real Moving Canada is a Saskatoon moving company for local and long-distance moves across Canada — residential, commercial, packing, storage, cleanouts and heavy items. Get a free moving quote.', {
    keywords: keywordsFor('home'),
    jsonLd: [businessJsonLd(), faqJsonLd(HOME_FAQ)],
  });
  return (
    <>
      <div className="home-fold">
        <HomeHero />
        <HeroServiceStrip />
        <TrustBar />
      </div>
      <section className="section estimate-band" aria-labelledby="estimate-band-title">
        <div className="wrap estimate-band-grid">
          <div>
            <Kicker>Instant estimate</Kicker>
            <h2 id="estimate-band-title">Get an instant moving estimate</h2>
            <p className="lead">Pick your route and home size to see a price range in seconds — then request a free quote and our team confirms the details.</p>
            <ul className="tick-list">
              <li><Icon name="check" />Local, long-distance and cross-Canada moves</li>
              <li><Icon name="check" />No account needed</li>
              <li><Icon name="check" />Free, no-obligation quote</li>
            </ul>
          </div>
          <RouteTicket />
        </div>
      </section>
      <section className="section white" aria-labelledby="help-title">
        <div className="wrap">
          <SectionHeader
            id="help-title" kicker="How we can help" title="Moving support for every stage"
            text="Choose the services you need, from careful packing and loading to storage, cleanouts, and oversized-item support."
            action={<Button to="/services" variant="dark" iconRight="arrow-right">View all services</Button>}
          />
          <ServiceGrid services={featured} showSummary swipe />
        </div>
      </section>
      <WhyChoose />
      <ProcessSteps />
      <ServiceAreasPanel />
      <HomeReviewForm />
      <HomeFaq />
    </>
  );
}
