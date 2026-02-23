import React, { useRef } from 'react';
import { ChevronLeft, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const contentRef = useRef(null);

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="container mx-auto flex items-center gap-3 px-4 pl-20">
  <img 
    src="/src/assets/logo.png" 
    alt="DCE Logo" 
    className="h-10 w-auto object-contain"
  />
</div>
          
          
        </div>
      </header>
     



    <div className="pl-[72px] w-full min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="max-w-[1600px] mx-auto px-6 py-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Legal information and data protection guidelines
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">

          {/* Meta Bar */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-gray-700">
                Current Version
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Effective Date:{' '}
              <span className="font-semibold text-gray-900">
                February 19, 2026
              </span>
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef} className="px-6 md:px-10 py-12">
            <div
              className="
                text-[16px] leading-8 text-gray-700
                [&_h3]:text-2xl
                [&_h3]:font-bold
                [&_h3]:text-gray-900
                [&_h3]:mt-16
                [&_h3]:mb-6
                [&_p]:my-5
                [&_ul]:my-6
                [&_ul]:pl-6
                [&_li]:my-3
                [&_li]:leading-7
                [&_strong]:text-gray-900
              "
            >
              <p className="text-[17px] leading-8 text-gray-800 max-w-none">
                Your privacy is important to us. This Privacy Policy explains how{' '}
                <strong>DCE English Language School</strong> ("DC App", "we", "our", or "us")
                collects, uses, stores, and protects your information when you use our website,
                mobile applications (Android & iOS), and related services (collectively, the
                "Services").
                </p>


              <h3>1. Information We Collect</h3>
              <p>
                We collect only the information necessary to provide and improve our
                educational services.
              </p>
              <ul>
                <li>
                  <strong>1.1 Personal Information:</strong> Name, email address,
                  phone number (if provided), login credentials (securely encrypted),
                  and optional profile details.
                </li>
                <li>
                  <strong>1.2 Usage & Device Information:</strong> App usage data,
                  device type, operating system, app version, IP address (approximate
                  location), log files, and crash reports.
                </li>
                <li>
                  <strong>1.3 Educational Data:</strong> Course enrollments, lesson
                  progress, completion status, and assessment results (if applicable).
                </li>
                <li>
                  <strong>1.4 Communications:</strong> Messages, feedback, and support
                  requests sent through the app.
                </li>
              </ul>

              <h3>2. How We Use Your Information</h3>
              <ul>
                <li>2.1 Provide English language learning services.</li>
                <li>2.2 Create and manage user accounts.</li>
                <li>2.3 Track learning progress and improve courses.</li>
                <li>2.4 Communicate updates, reminders, and support responses.</li>
                <li>2.5 Improve app performance, security, and user experience.</li>
                <li>2.6 Comply with legal and regulatory requirements.</li>
              </ul>

              <h3>3. Legal Basis for Processing</h3>
              <ul>
                <li><strong>3.1 Consent:</strong> When you voluntarily provide data.</li>
                <li><strong>3.2 Contract:</strong> To deliver educational services.</li>
                <li>
                  <strong>3.3 Legitimate Interests:</strong> To improve and secure the
                  Services.
                </li>
                <li>
                  <strong>3.4 Legal Obligations:</strong> To comply with applicable
                  laws.
                </li>
              </ul>

              <h3>4. Cookies & Tracking Technologies</h3>
              <ul>
                <li>4.1 Maintain login sessions.</li>
                <li>4.2 Remember user preferences.</li>
                <li>4.3 Analyze app performance.</li>
              </ul>

              <h3>5. Data Sharing & Disclosure</h3>
              <ul>
                <li>5.1 We do not sell or rent personal data.</li>
                <li>
                  5.2 Trusted service providers (hosting, analytics, support) under
                  strict confidentiality agreements.
                </li>
                <li>
                  5.3 Legal disclosure when required by law or to protect safety.
                </li>
                <li>5.4 Business transfers under the same privacy protections.</li>
              </ul>

              <h3>6. Data Retention</h3>
              <p>
                We retain personal data only as long as necessary to provide services,
                meet legal obligations, and resolve disputes. You may request deletion
                at any time.
              </p>

              <h3>7. International Data Transfers</h3>
              <p>
                Your data may be processed outside your country with appropriate
                safeguards in place.
              </p>

              <h3>8. Data Security</h3>
              <ul>
                <li>8.1 Secure servers and encrypted storage.</li>
                <li>8.2 Access controls and regular monitoring.</li>
                <li>
                  8.3 Continuous improvements to protect against unauthorized access.
                </li>
              </ul>

              <h3>9. Children’s Privacy</h3>
              <p>
                DC App does not knowingly collect personal data from children under 13
                without parental consent. If detected, such data will be removed
                immediately.
              </p>

              <h3>10. Your Rights</h3>
              <ul>
                <li>10.1 Access, update, or delete your personal data.</li>
                <li>10.2 Withdraw consent at any time.</li>
                <li>10.3 Object to or restrict certain processing.</li>
                <li>10.4 Request data portability where applicable.</li>
              </ul>

              <h3>11. Third-Party Links</h3>
              <p>
                Our Services may include links to third-party websites. We are not
                responsible for their privacy practices.
              </p>

              <h3>12. Changes to This Policy</h3>
              <p>
                We may update this Privacy Policy periodically. Continued use of the
                Services indicates acceptance of the updated policy.
              </p>

              <h3>13. Contact Us</h3>
              <p>
                Email: <strong>support@dcedu.ie</strong>
              </p>

              {/* Support CTA */}
              <div className="mt-20 p-8 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row justify-between gap-6">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    Have questions about your privacy?
                  </h4>
                  <p className="text-sm text-gray-600 mt-2">
                    Contact us for any data-related concerns or requests.
                  </p>
                </div>
                <a
                  href="mailto:support@dcedu.ie"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:border-blue-400 transition"
                >
                  <Mail size={16} />
                  Contact Support
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} DCE English Language School. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
