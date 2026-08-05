import React from 'react';
import { motion } from 'motion/react';
import { ScrollText, ShoppingBag, RefreshCcw, Truck, AlertCircle, Scale } from 'lucide-react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const sections = [
  {
    icon: <ShoppingBag className="w-5 h-5 text-warm-accent" />,
    title: 'Orders & Payments',
    content: [
      {
        subtitle: 'Order Acceptance',
        text: 'All orders placed on our website are subject to availability and acceptance by Kaaram Kathalu. We reserve the right to cancel or refuse any order at our discretion, including due to stock unavailability, pricing errors, or suspected fraudulent activity. In such cases, a full refund will be issued.',
      },
      {
        subtitle: 'Pricing',
        text: 'All prices displayed on our website are in Indian Rupees (₹) and are inclusive of applicable taxes. Prices are subject to change without prior notice. The price applicable to your order will be the price displayed at the time of checkout.',
      },
      {
        subtitle: 'Payment',
        text: 'We accept all major credit/debit cards, UPI, net banking, and select wallets. Payment must be made in full at the time of placing the order. All transactions are processed through secure, encrypted payment gateways.',
      },
    ],
  },
  {
    icon: <Truck className="w-5 h-5 text-warm-accent" />,
    title: 'Shipping & Delivery',
    content: [
      {
        subtitle: 'Delivery Areas',
        text: 'We currently deliver to most locations within India. Delivery availability is confirmed at checkout based on your pincode.',
      },
      {
        subtitle: 'Delivery Timelines',
        text: 'Orders are typically dispatched within 2–4 business days of confirmation. Estimated delivery times are 4–8 business days depending on your location. Delivery timelines are indicative and may vary due to courier delays or unforeseen circumstances.',
      },
      {
        subtitle: 'Free Shipping',
        text: 'Free shipping is available on orders above ₹999. Orders below this threshold will incur a standard shipping charge displayed at checkout.',
      },
    ],
  },
  {
    icon: <RefreshCcw className="w-5 h-5 text-warm-accent" />,
    title: 'Returns & Refunds',
    content: [
      {
        subtitle: 'Return Policy',
        text: 'Due to the perishable nature of our products, we generally do not accept returns. However, if you receive a damaged, defective, or incorrect product, please contact us within 48 hours of delivery with photographs of the issue.',
      },
      {
        subtitle: 'Refund Process',
        text: 'Approved refunds will be processed within 5–7 business days to your original payment method. We may offer a replacement or store credit as an alternative.',
      },
      {
        subtitle: 'Replacement Delivery',
        text: 'If a replacement product is approved, it will be delivered to your location within 5–7 working days from the date of approval. Replacement shipments are subject to product availability.',
      },
      {
        subtitle: 'Cancellations',
        text: 'Orders can be cancelled within 12 hours of placement by contacting our support team. Once dispatched, orders cannot be cancelled.',
      },
    ],
  },
  {
    icon: <AlertCircle className="w-5 h-5 text-warm-accent" />,
    title: 'Product Information',
    content: [
      {
        subtitle: 'Artisanal Nature',
        text: 'All our products are handcrafted in small batches using traditional recipes. Minor variations in colour, texture, and taste are natural and expected — they reflect the authentic, artisanal character of our products.',
      },
      {
        subtitle: 'Shelf Life & Storage',
        text: 'Each product\'s shelf life and recommended storage instructions are printed on the packaging. Please follow these guidelines to ensure optimal taste and freshness. Kaaram Kathalu will not be responsible for products that are not stored as recommended.',
      },
      {
        subtitle: 'Allergens',
        text: 'Our products are made in kitchens that handle a range of ingredients including sesame, mustard, peanuts, and various spices. If you have specific dietary requirements or allergies, please review product descriptions carefully or contact us before ordering.',
      },
    ],
  },
  {
    icon: <Scale className="w-5 h-5 text-warm-accent" />,
    title: 'Limitation of Liability',
    content: [
      {
        subtitle: 'Disclaimer',
        text: 'Kaaram Kathalu provides its website and services on an "as is" basis. We make no representations or warranties of any kind, express or implied, about the completeness, accuracy, or reliability of our website content.',
      },
      {
        subtitle: 'Liability Cap',
        text: 'To the fullest extent permitted by law, Kaaram Kathalu will not be liable for any indirect, incidental, or consequential damages arising out of your use of our website or products. Our total liability shall not exceed the value of the order giving rise to the claim.',
      },
    ],
  },
  {
    icon: <ScrollText className="w-5 h-5 text-warm-accent" />,
    title: 'Governing Law',
    content: [
      {
        subtitle: 'Jurisdiction',
        text: 'These Terms & Conditions are governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.',
      },
      {
        subtitle: 'Changes to Terms',
        text: 'Kaaram Kathalu reserves the right to update these Terms & Conditions at any time. Continued use of our website following any changes constitutes your acceptance of the updated terms. We encourage you to review this page periodically.',
      },
    ],
  },
];

export default function TermsAndConditions() {
  return (
    <div className="pt-8 pb-24 px-4 sm:px-6 md:px-12 w-full max-w-[100vw] overflow-x-hidden">
      <SEO
        title="Terms & Conditions"
        description="Read the terms and conditions governing the use of the Kaaram Kathalu website and the purchase of our artisanal Andhra products."
        url="https://www.kaaramkathalu.in/terms-and-conditions"
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
            Terms &amp;{' '}
            <span className="text-warm-accent italic">Conditions</span>
          </h1>
          <div className="w-16 h-0.5 bg-warm-accent mx-auto mb-6" />
          <p className="font-serif italic text-warm-dark/70 text-base md:text-lg max-w-2xl mx-auto">
            By using our website and placing orders, you agree to the following terms. Please read them carefully.
          </p>
          <p className="mt-4 text-xs font-heading tracking-widest text-warm-dark/40 uppercase">
            Last updated: August 2025
          </p>
        </div>

        {/* Intro Card */}
        <div className="bg-white border border-warm-dark/10 rounded-2xl p-8 md:p-10 mb-10 shadow-sm">
          <p className="font-serif text-warm-dark/80 leading-relaxed text-base md:text-lg">
            Welcome to <strong>Kaaram Kathalu</strong>. These Terms &amp; Conditions govern your use of our website
            and the purchase of products from us. By accessing our website or placing an order, you confirm that
            you are at least 18 years of age and agree to be bound by these terms.
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
            Need Clarification?
          </h2>
          <p className="font-serif text-warm-bg/70 text-sm mb-6">
            If you have questions about these terms, please don't hesitate to get in touch with our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="mailto:kaaram.kathalu2025@gmail.com"
              className="text-warm-accent font-heading text-sm tracking-wider hover:text-white transition-colors"
            >
              kaaram.kathalu2025@gmail.com
            </a>
            <span className="hidden sm:block text-warm-bg/30">|</span>
            <a
              href="tel:+917676644366"
              className="text-warm-accent font-heading text-sm tracking-wider hover:text-white transition-colors"
            >
              +91 76766 44366
            </a>
          </div>
        </div>

        {/* Footer nav */}
        <div className="mt-10 text-center">
          <p className="font-serif text-warm-dark/50 text-sm">
            Also see our{' '}
            <Link to="/privacy-policy" className="text-warm-accent hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </motion.div>
    </div>
  );
}
