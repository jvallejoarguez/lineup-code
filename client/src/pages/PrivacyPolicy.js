import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link to="/" className="inline-flex items-center mb-8 text-blue-600 dark:text-blue-400 hover:underline">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="mb-4">
              LINE.UP is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our application.
            </p>
            <p>
              We do not sell your personal data to third parties. As a free service, we collect minimal information necessary to provide you with our productivity tools.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p className="mb-4">We collect the following information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email address (for account creation)</li>
              <li>Tasks and workflow data you create within the application</li>
              <li>Usage statistics to improve our service</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain our service</li>
              <li>Improve and personalize your experience</li>
              <li>Communicate with you about updates or changes</li>
              <li>Ensure the security of your account</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Storage and Security</h2>
            <p>
              Your data is stored securely using industry-standard encryption and security practices. We use Supabase for our backend services, which provides robust security measures to protect your information.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">AI Assistant and Data Processing</h2>
            <p className="mb-4">
              Our AI Assistant is powered by DeepSeek technology. When you interact with the AI Assistant:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your queries are processed to provide helpful responses</li>
              <li>We do not permanently store the content of your conversations</li>
              <li>Anonymized data may be used to improve the AI's capabilities</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us through our GitHub repository.
            </p>
          </section>
        </div>
        
        <div className="mt-12 text-sm text-gray-600 dark:text-gray-400">
          Last Updated: March 1, 2024
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 