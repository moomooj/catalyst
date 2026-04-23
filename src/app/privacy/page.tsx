import { Raleway } from "next/font/google";

const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export const metadata = {
  title: "Privacy Policy | Catalyst Bar",
};

export default function PrivacyPage() {
  return (
    <main className={`${raleway.className} bg-white text-[#1A1A1A] p-6 md:p-20 max-w-full text-[11px] leading-[1.3]`}>
      <div className="max-w-4xl mx-auto border border-gray-200 p-8 md:p-16 bg-white shadow-sm">
        <h1 className="text-sm font-bold uppercase mb-1 underline tracking-tight">PRIVACY POLICY</h1>
        <p className="mb-8 text-gray-400">Effective Date: April 22, 2026</p>
        
        <div className="mb-10 space-y-1">
          <p className="font-bold uppercase text-[9px] text-gray-500 tracking-widest">Business Information</p>
          <p>Catalyst Bar (Mobile Bartending Services)</p>
          <p>136 W Cordova St, Vancouver, BC V6B 2N3, Canada</p>
          <p>Phone: (778) 814-9909</p>
          <p>Email: events@catalystbar.ca</p>
        </div>

        <div className="space-y-6 text-justify">
          <section>
            <h2 className="font-bold mb-1">1. OVERVIEW</h2>
            <p>
              Catalyst Bar provides mobile bartending services and is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal information in accordance with the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable Canadian privacy laws.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-1">2. INFORMATION WE COLLECT</h2>
            <p>
              We do not require account registration. We only collect the minimum information necessary to provide our services, including: full name, email address, phone number, event booking details (date, location, service requests, etc.), and payment-related information (when applicable via Stripe).
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-1">3. HOW WE USE YOUR INFORMATION</h2>
            <p>
              We use your information for the following purposes: To process and manage bookings; To confirm and communicate event details; To provide customer support; To process payments and transactions; To improve service delivery and operations. We do not sell or rent your personal information to any third parties.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-1">4. PAYMENT PROCESSING (STRIPE)</h2>
            <p>
              We use Stripe as our third-party payment processor to securely handle payments. During payment processing, certain information may be shared directly with Stripe, which is governed by Stripe’s own privacy policy and security standards. We do not store sensitive payment details such as full credit card numbers.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-1">5. DATA PROTECTION</h2>
            <p>
              We take reasonable administrative, technical, and physical safeguards to protect your personal information against loss, theft, unauthorized access, disclosure, or modification. However, no method of electronic storage or transmission is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-1">6. SHARING OF INFORMATION</h2>
            <p>
              We may share your personal information only in limited cases, such as: payment processing through Stripe, third-party vendors assisting in event execution, or when required by law or government authorities. All third parties are required to handle your information securely and in compliance with applicable privacy laws.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-1">7. DATA RETENTION</h2>
            <p>
              We retain personal information only as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-1">8. COOKIES & ANALYTICS</h2>
            <p>
              Our website may use cookies or analytics tools to improve user experience and analyze website traffic. This data does not personally identify you.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-1">9. YOUR RIGHTS</h2>
            <p>
              You have the right to request access to your personal information, request correction of inaccurate information, or request deletion of your personal data (subject to legal requirements). To exercise these rights, please contact us using the information provided.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-1">10. CONTACT US</h2>
            <p>
              If you have any questions about this Privacy Policy or your personal data, please contact us at: events@catalystbar.ca, (778) 814-9909, or at our business address at 136 W Cordova St, Vancouver, BC.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-1">11. CHANGES TO THIS POLICY</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.
            </p>
          </section>
        </div>

        <div className="mt-16 text-gray-300 text-[8px] tracking-[0.2em] border-t pt-4">
          OFFICIAL DOCUMENT: CATALYST-BAR-PRIVACY-2026-V1
        </div>
      </div>
    </main>
  );
}
