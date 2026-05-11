import { Raleway } from "next/font/google";

const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export const metadata = {
  title: "Terms of Service | Catalyst Bar",
};

export default function TermsPage() {
  return (
    <main className={`${raleway.className} bg-[#FDFCFB] text-[#1A1A1A] w-full min-h-screen pt-32 md:pt-48 pb-16 md:pb-32 px-6`}>
      <div className="max-w-4xl mx-auto border border-[#D6CAB7] p-8 md:p-16 bg-white shadow-sm">
        <h1 className="text-sm font-bold uppercase mb-1 underline tracking-tight text-[#303520]">TERMS OF SERVICE</h1>
        <p className="mb-8 text-gray-400">Last Updated: May 2026</p>
        
        <div className="space-y-8 text-[11px] leading-[1.6]">
          <section>
            <h2 className="font-bold mb-2 text-[#303520]">1. Booking &amp; Payments</h2>
            <p>
              A signed agreement and deposit are required to secure your event date.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>A 50% deposit is required for standard bookings</li>
              <li>Remaining balances are due 30 days prior to the event</li>
              <li>Events booked within 30 days of the event date may require full payment upfront</li>
            </ul>
            <p className="mt-3">
              Payments made within 45 days of the event are generally non-refundable due to staffing, preparation, and scheduling commitments.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-2 text-[#303520]">2. Alcohol Service &amp; Licensing</h2>
            <p>
              Catalyst Mobile Bar provides mobile bartending and beverage catering services for private events.
            </p>
            <p className="mt-3">Depending on the selected package:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Dry Hire Packages: Clients are responsible for purchasing alcohol and obtaining any required Special Event Permit (SEP)</li>
              <li>All-Inclusive Packages: Alcohol service may be supplied and managed through licensed hospitality partnerships in accordance with applicable BC liquor regulations</li>
            </ul>
            <p className="mt-3">
              A valid SEP must be available on-site prior to the commencement of alcohol service where required.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-2 text-[#303520]">3. Responsible Service</h2>
            <p>
              Catalyst Mobile Bar follows British Columbia “Serving It Right” standards.
            </p>
            <p className="mt-3">Our staff reserve the right to:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Refuse alcohol service to intoxicated guests</li>
              <li>Request valid government-issued identification</li>
              <li>Refuse service where valid identification cannot be provided</li>
              <li>End alcohol service if safety concerns arise</li>
            </ul>
            <p className="mt-3">
              These decisions are made to maintain a safe and responsible event environment.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-2 text-[#303520]">4. Event Safety &amp; Liability</h2>
            <p>
              Clients are responsible for ensuring that their event environment remains safe and compliant with applicable laws and venue requirements.
            </p>
            <p className="mt-3">Catalyst Mobile Bar is not responsible for:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Alcohol consumption after service has concluded</li>
              <li>Guest behavior outside of staffed service hours</li>
              <li>Delays or interruptions caused by venue restrictions, weather, or circumstances beyond reasonable control</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold mb-2 text-[#303520]">5. Equipment &amp; Property</h2>
            <p>
              Clients may be held responsible for theft, loss, or significant damage to Catalyst Mobile Bar equipment or rental items caused by guests or attendees during the event.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-2 text-[#303520]">6. Cancellations &amp; Rescheduling</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Cancellations made more than 45 days before the event may qualify for a deposit refund</li>
              <li>Rescheduling requests are subject to availability</li>
              <li>Additional fees may apply for rush bookings or last-minute date changes</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold mb-2 text-[#303520]">7. Photography &amp; Marketing</h2>
            <p>
              Catalyst Mobile Bar may capture photographs or videos of event setups, bar installations, and service environments for promotional purposes.
            </p>
            <p className="mt-3">
              Clients requesting a fully private event experience must notify us in writing prior to the event date.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-2 text-[#303520]">8. Force Majeure</h2>
            <p>
              Neither party shall be held responsible for delays or cancellations caused by circumstances beyond reasonable control, including severe weather, government restrictions, emergencies, or infrastructure disruptions.
            </p>
            <p className="mt-3">
              Where possible, both parties will make reasonable efforts to reschedule the event.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-2 text-[#303520]">9. Contact</h2>
            <p>
              For questions regarding these Terms &amp; Conditions, please contact:
            </p>
            <p className="mt-3">
              Catalyst Mobile Bar
              <br />
              Vancouver, BC
              <br />
              <a href="mailto:events@catalystbar.ca" className="text-[#7C826F] underline underline-offset-2 hover:text-[#303520]">
                events@catalystbar.ca
              </a>
            </p>
          </section>
        </div>

        <div className="mt-16 border-t pt-4" />
      </div>
    </main>
  );
}
