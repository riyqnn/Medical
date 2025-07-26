import React, { useState, useEffect } from 'react';
import { ChevronRight, Shield, Users, BarChart3, Clock, CheckCircle, ArrowRight, Menu, X, Phone, Mail, MapPin } from 'lucide-react';
import Navigation from '../components/nav';
import Logo from '/logo.png';
import LogoWhite from '/logo-white.png';

// Hero Section Component
const HeroSection = () => {
  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Streamline
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
                Hospital Operations
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Transform hospital's administrative processes with our comprehensive management platform. 
              Reduce costs, improve efficiency, and focus on what matters most - patient care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 flex items-center justify-center">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all">
                Schedule Demo
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="bg-white rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-semibold">System Status: Online</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">1,247</div>
                    <div className="text-sm text-gray-600">Active Staff</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">98.5%</div>
                    <div className="text-sm text-gray-600">Efficiency</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-4 text-white">
                  <div className="text-sm opacity-80">Monthly Savings</div>
                  <div className="text-3xl font-bold">$127,500</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Stats Section Component
const StatsSection = ({ animateStats }) => {
  const stats = [
    { number: "500+", label: "Hospitals Served" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "40%", label: "Cost Reduction" },
    { number: "24/7", label: "Support Available" }
  ];

  return (
    <section id="stats" className="py-16 bg-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-4xl font-bold text-blue-600 mb-2 transition-all duration-1000 ${
                animateStats ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
              }`} style={{ transitionDelay: `${index * 200}ms` }}>
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Feature Card Component
const FeatureCard = ({ feature, index }) => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
      <div className="text-blue-600 mb-4">
        {feature.icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">
        {feature.title}
      </h3>
      <p className="text-gray-600">
        {feature.description}
      </p>
    </div>
  );
};

// Features Section Component
const FeaturesSection = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "HIPAA Compliant Security",
      description: "Bank-level encryption and security protocols to protect sensitive patient data and administrative information."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Staff Management",
      description: "Streamline scheduling, payroll, and HR processes with automated workflows and real-time updates."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics & Reporting",
      description: "Comprehensive dashboards and custom reports to optimize operations and improve decision-making."
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "24/7 Support",
      description: "Round-the-clock technical support and maintenance to ensure the systems run smoothly."
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Modern Healthcare
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform provides everything you need to manage hospital's administrative operations efficiently and securely.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Benefits Section Component
const BenefitsSection = () => {
  const benefits = [
    "Reduce administrative costs by up to 40%",
    "Improve staff productivity with automated workflows",
    "Ensure compliance with healthcare regulations",
    "Real-time data access and reporting",
    "Seamless integration with existing systems",
    "Scalable solutions for hospitals of all sizes"
  ];

  return (
    <section id="benefits" className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">
              Why Choose Medly?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Join hundreds of hospitals that have transformed their operations and improved patient care with our platform.
            </p>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Ready to Get Started?</h3>
                <p className="opacity-90">Experience the difference today</p>
              </div>
              <div className="space-y-4">
                <button className="w-full bg-white text-blue-600 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105">
                  Start Your Free Trial
                </button>
                <button className="w-full border-2 border-white text-white py-4 rounded-lg font-semibold hover:bg-white/10 transition-all">
                  Request a Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Contact Card Component
const ContactCard = ({ icon, title, info }) => {
  return (
    <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
      <div className="text-blue-600 mx-auto mb-4 flex justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <div className="text-gray-600">{info}</div>
    </div>
  );
};

// Contact Section Component
const ContactSection = () => {
  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-600">
            Ready to transform hospital's operations? Contact us today.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <ContactCard 
            icon={<Phone className="w-12 h-12" />}
            title="Call Us"
            info="+1 (555) 123-4567"
          />
          <ContactCard 
            icon={<Mail className="w-12 h-12" />}
            title="Email Us"
            info="hello@medly.com"
          />
          <ContactCard 
            icon={<MapPin className="w-12 h-12" />}
            title="Visit Us"
            info={<>123 Healthcare Ave<br />Medical District, NY 10001</>}
          />
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4 w-20">
              <img src={LogoWhite} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Streamlining hospital administration with cutting-edge technology and unparalleled support.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Staff Management</li>
              <li>Financial Operations</li>
              <li>Compliance Monitoring</li>
              <li>Analytics & Reporting</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li>About Us</li>
              <li>Careers</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Medly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Main Component
export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id === 'stats') {
            setAnimateStats(true);
          }
        });
      },
      { threshold: 0.5 }
    );
    
    const statsElement = document.getElementById('stats');
    if (statsElement) observer.observe(statsElement);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation 
        isScrolled={isScrolled} 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
        icons={{Shield,Menu}}
      />
      <HeroSection />
      <StatsSection animateStats={animateStats} />
      <FeaturesSection />
      <BenefitsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}