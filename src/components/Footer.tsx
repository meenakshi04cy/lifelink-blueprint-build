import { Heart, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">LifeLink</span>
            </div>
            <p className="text-muted-foreground">
              Connecting lives through blood donation. Every drop counts.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">For Donors</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">For Recipients</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blood Types</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Health Guidelines</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Partner Hospitals</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                support@lifelink.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                1-800-LIFELINK
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Available Nationwide
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 LifeLink. All rights reserved. Saving lives, one donation at a time.</p>
        </div>
      </div>
    </footer>
  );
};
