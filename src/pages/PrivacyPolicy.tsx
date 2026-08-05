import React from 'react';
import { motion } from 'motion/react';
import { Shield, Eye, Lock, Database, Mail, Phone } from 'lucide-react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const sections = [
  {
    icon: <Database className="w-5 h-5 text-warm-accent" />,
    title: 'Information We Collect',
    content: [
      {
        subtitle: 'Personal Information',
        text: 'When you place an order or create an account with Kaaram Kathalu, we collect information such as your name, email address, phone number, and delivery address. This information is necessary to process and deliver your orders.',
      },
      {
        subtitle: 'Payment Information',
        text: 'All payment transactions are securely processed through our payment gateway partners. We do not store your full credit or debit card numbers on our servers. Only tokenised references required for refunds are retained.',
      },
      {
        subtitle: 'Usage Data',
        text: 'We may collect information about how you interact with our website — such as pages visited, products viewed, and time spent — to help us improve your experience.',
      },
    ],
  },
  {
    icon: <Eye className="w-5 h-5 text-warm-accent" />,
    title: 'How We Use Your Information',
    content: [
      {
        subtitle: 'Order Processing',
        text: 'Your personal details are used primarily to process, fulfil, and deliver your orders, and to send you order confirmations and updates.',
      },
      {
        subtitle: 'Customer Support',
        text: 'We use your contact information to respond to queries, resolve complaints, and provide after-sales support.',
      },
      {
        subtitle: 'Marketing Communications',
        text: 'With your consent, we may send you newsletters, offers, or updates about our products. You can opt out at any time by clicking the unsubscribe link in any email or by contacting us directly.',
      },
    ],
  },
  {
    icon: <Shield className="w-5 h-5 text-warm-accent" />,
    title: 'How We Protect Your Data',
    content: [
      {
        subtitle: 'Security Measures',
        text: 'We implement industry-standard security measures, including SSL encryption, to protect your personal data during transmission and storage. Access to your information is restricted to authorised personnel only.',
      },
      {
        subtitle: 'Third-Party Services',
        text: 'We work with trusted third-party service providers (e.g., payment processors, logistics partners) who are contractually obligated to protect your data and use it only for the services they provide to us.',
      },
    ],
  },
  {
    icon: <Lock className="w-5 h-5 text-warm-accent" />,
    title: 'Your Rights & Choices',
    content: [
      {
        subtitle: 'Access & Correction',
        text: 'You have the right to access, update, or correct the personal information we hold about you. You can do this by logging into your account or contacting our support team.',
      },
      {
        subtitle: 'Data Deletion',
        text: 'You may request the deletion of your personal data. We will comply, subject to any legal obligations that require us to retain certain records.',
      },
      {
        subtitle: 'Cookies',
        text: 'Our website uses cookies to enhance your browsing experience. You may disable cookies in your browser settings, though this may affect certain features of our site.',
      },
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="pt-8 pb-24 px-4 sm:px-6 md:px-12 w-full max-w-[100vw] overflow-x-hidden">
      <SEO
        title="Privacy Policy"
        description="Learn how Kaaram Kathalu collects, uses, and protects your personal information when you shop with us."
        url="https://www.kaaramkathalu.in/privacy-policy"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Page Header */}
        <div className="text-center mb-16">
          <span className="font-heading text-warm-accent text-xs font-bold tracking-[0.2em] uppercase">
            Legal &amp; Compliance
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-warm-dark mt-2 mb-4 uppercase">
            Privacy{' '}
            <span className="text-warm-accent italic">Policy</span>
          </h1>
          <div className="w-16 h-0.5 bg-warm-accent mx-auto mb-6" />
          <p className="font-serif italic text-warm-dark/70 text-base md:text-lg max-w-2xl mx-auto">
            Your trust means everything to us. Here's how we handle and protect your personal information.
          </p>
          <p className="mt-4 text-xs font-heading tracking-widest text-warm-dark/40 uppercase">
            Last updated: August 2025
          </p>
        </div>

        {/* Intro Card */}
        <div className="bg-white border border-warm-dark/10 rounded-2xl p-8 md:p-10 mb-10 shadow-sm">
          <p className="font-serif text-warm-dark/80 leading-relaxed text-base md:text-lg">
            At <strong>Kaaram Kathalu</strong>, we are committed to safeguarding your privacy. This Privacy Policy
            explains what information we collect, why we collect it, and how we use and protect it. By using our
            website or placing an order, you agree to the practices described in this policy.
          </p>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-8">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className="bg-white border border-warm-dark/10 rounded-2xl p-8 md:p-10 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-full bg-warm-accent/10 flex items-center justify-center flex-shrink-0">
                  {section.icon}
                </div>
                <h2 className="font-heading text-xl font-bold text-warm-dark uppercase tracking-wider">
                  {section.title}
                </h2>
              </div>

              <div className="flex flex-col gap-6">
                {section.content.map((item) => (
                  <div key={item.subtitle}>
                    <h3 className="font-heading text-sm font-bold text-warm-accent uppercase tracking-widest mb-2">
                      {item.subtitle}
                    </h3>
                    <p className="font-serif text-warm-dark/70 leading-relaxed text-sm md:text-base">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Block */}
        <div className="mt-10 bg-warm-dark text-warm-bg rounded-2xl p-8 md:p-10 text-center">
          <h2 className="font-heading text-xl font-bold uppercase tracking-wider mb-2">
            Questions or Concerns?
          </h2>
          <p className="font-serif text-warm-bg/70 text-sm mb-6">
            If you have any questions about this Privacy Policy or our data practices, please reach out to us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="mailto:kaaram.kathalu2025@gmail.com"
              className="flex items-center gap-2 text-warm-accent font-heading text-sm tracking-wider hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4" />
              kaaram.kathalu2025@gmail.com
            </a>
            <span className="hidden sm:block text-warm-bg/30">|</span>
            <a
              href="tel:+917676644366"
              className="flex items-center gap-2 text-warm-accent font-heading text-sm tracking-wider hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4" />
              +91 76766 44366
            </a>
          </div>
        </div>

        {/* Footer nav */}
        <div className="mt-10 text-center">
          <p className="font-serif text-warm-dark/50 text-sm">
            Also see our{' '}
            <Link to="/terms-and-conditions" className="text-warm-accent hover:underline">
              Terms &amp; Conditions
            </Link>
            .
          </p>
        </div>
      </motion.div>
    </div>
  );
}
