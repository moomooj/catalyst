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
    <main className={`${raleway.className} bg-[#FDFCFB] text-[#1A1A1A] w-full min-h-screen pt-32 md:pt-48 pb-16 md:pb-32 px-6`}>
      <div className="max-w-4xl mx-auto border border-[#D6CAB7] p-8 md:p-16 bg-white shadow-sm">
        <h1 className="text-sm font-bold uppercase mb-1 underline tracking-tight text-[#303520]">PRIVACY POLICY</h1>
        <p className="mb-8 text-gray-400">Effective Date: April 22, 2026</p>
        
        <div className="mb-10 space-y-1">
          <p className="font-bold uppercase text-[9px] text-[#7C826F] tracking-widest">Business Information</p>
          <p>Catalyst Bar (Mobile Bartending Services)</p>
          <p>136 W Cordova St, Vancouver, BC V6B 2N3, Canada</p>
          <p>Phone: (778) 814-9909</p>
          <p>Email: events@catalystbar.ca</p>
        </div>

        <div className="space-y-8 text-justify text-[11px] leading-[1.5]">
          <section>
            <h2 className="font-bold mb-2 text-[#303520]">1. OVERVIEW</h2>
            <p>
              Catalyst Bar provides mobile bartending services and is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal information in accordance with the Personal Information Protection and Electronic Documents Act (PIPEDA) and other applicable Canadian privacy laws, including British Columbia's Personal Information Protection Act (PIPA).
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-2 text-[#303520]">2. INFORMATION WE COLLECT</h2>
            <p className="mb-2">
              We do not require account registration. We only collect the minimum information necessary to provide our services, including:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Event booking details (date, location, service requests, etc.)</li>
              <li>Payment-related information (when applicable via Stripe)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold mb-2 text-[#303520]">3. HOW WE USE YOUR INFORMATION</h2>
            <p className="mb-2">
              We use your information for the following purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>To process and manage bookings</li>
              <li>To confirm and communicate event details</li>
              <li>To provide customer support</li>
              <li>To process payments and transactions</li>
              <li>To improve service delivery and operations</li>
            </ul>
            <p className="mt-3">We do not sell or rent your personal information to any third parties.</p>
          </section>

          <section>
            <h2 className="font-bold mb-2 text-[#303520]">4. PAYMENT PROCESSING (STRIPE)</h2>
            <p className="mb-4">
              We use Stripe as our third-party payment processor to securely handle payments. During payment processing, your payment information is collected and processed directly by Stripe. We do not have access to or store your full payment details such as complete credit card numbers.
            </p>
            <p>
              Your information may be transferred to and processed in countries outside of Canada, including the United States, where data protection laws may differ from those in Canada. Stripe’s handling of your data is governed by its own privacy policy and security standards.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-2 text-[#303520]">5. DATA PROTECTION</h2>
            <p>
              We take reasonable administrative, technical, and physical safeguards to protect your personal information against loss, theft, unauthorized access, disclosure, or modification. However, no method of electronic storage or transmission is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-2 text-[#303520]">6. SHARING OF INFORMATION</h2>
            <p>
              We may share your personal information only when necessary for payment processing (e.g., Stripe) or when required by law or government authorities.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-2 text-[#303520]">7. DATA RETENTION</h2>
            <p>
              We retain personal information only as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-2 text-[#303520]">8. COOKIES & TECHNICAL DATA</h2>
            <p className="mb-4">
              Our website does not use cookies or tracking technologies for analytics or advertising purposes.
            </p>
            <p>
              We may collect limited, non-identifiable technical information such as server logs (including IP address and request data) through our hosting provider, Vercel, which may process data on our behalf to maintain website performance and security.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-2 text-[#303520]">9. YOUR RIGHTS</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Request access to your personal information</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal data (subject to legal requirements)</li>
            </ul>
            <p className="mt-3">To exercise these rights, please contact us using the information provided below.</p>
          </section>

          <section>
            <h2 className="font-bold mb-2 text-[#303520]">10. CONTACT US</h2>
            <div className="space-y-1">
              <p>Email: events@catalystbar.ca</p>
              <p>Phone: (778) 814-9909</p>
              <p>Address: 136 W Cordova St, Vancouver, BC V6B 2N3, Canada</p>
              <p className="mt-4 font-bold">Privacy Officer: Catalyst Bar Management</p>
            </div>
          </section>

          <section>
            <h2 className="font-bold mb-2 text-[#303520]">11. CHANGES TO THIS POLICY</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.
            </p>
          </section>
        </div>

        <div className="mt-16 text-gray-300 text-[8px] tracking-[0.2em] border-t pt-4 text-center">
          OFFICIAL DOCUMENT: CATALYST-BAR-PRIVACY-2026-V2
        </div>
      </div>
    </main>
  );
}
