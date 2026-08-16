import Header from '../components/Header';
import Hero from '../components/Hero';
import Story from '../components/Story';
import MenuSection from '../components/MenuSection';
import WhyForno from '../components/WhyForno';
import Reviews from '../components/Reviews';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import BookingModal from '../components/BookingModal';
import { BookingProvider } from '../context/BookingContext';

export default function Home() {
  return (
    <BookingProvider>
      <Header />
      <Hero />
      <Story />
      <MenuSection />
      <WhyForno />
      <Reviews />
      <Contact />
      <Footer />
      <BookingModal />
    </BookingProvider>
  );
}
