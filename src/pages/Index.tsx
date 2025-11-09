import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Features } from "@/components/Features";
import { ForRecipients } from "@/components/ForRecipients";
import { ForDonors } from "@/components/ForDonors";
import { CallToAction } from "@/components/CallToAction";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <HowItWorks />
      <Features />
      <ForRecipients />
      <ForDonors />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Index;
