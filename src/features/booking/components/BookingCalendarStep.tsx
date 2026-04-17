"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBookingAction } from "../actions";
import {
  ALL_INCLUSIVE_MIN_COCKTAIL_COUNT,
  ALL_INCLUSIVE_MIN_HOURS,
  BOOKING_PACKAGE_ALL_INCLUSIVE,
  MIN_LEAD_DAYS,
} from "../constants";
import { Raleway } from "next/font/google";

const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

type CalendarDay = {
  key: string;
  dayLabel: number;
  isoDate: string;
  isCurrentMonth: boolean;
  isBeforeLeadTime: boolean;
};

type CocktailMenuItem = {
  id: string;
  name: string;
  image: string;
};

const packageOptions = [
  {
    id: "essential",
    name: "Essential",
    price: 1000,
    description: "Perfect for intimate gatherings and private celebrations.",
    drinkChoices: [
      { id: "choice-1", name: "2 Signature Cocktails", price: 0, cocktails: 2 },
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: 1500,
    description: "Our most popular choice for weddings and medium events.",
    drinkChoices: [
      { id: "choice-2", name: "3 Signature Cocktails", price: 200, cocktails: 3 },
      { id: "choice-3", name: "4 Signature Cocktails", price: 400, cocktails: 4 },
    ],
  },
  {
    id: "premium",
    name: "Editorial",
    price: 2500,
    description: "High-touch service with a full-format cocktail menu.",
    drinkChoices: [
      { id: "choice-4", name: "5 Signature Cocktails", price: 600, cocktails: 5 },
      { id: "choice-5", name: "6 Signature Cocktails", price: 800, cocktails: 6 },
    ],
  },
];

const addonOptions = [
  { id: "extra-hour", name: "Additional Hour", price: 200 },
  { id: "custom-menu", name: "Custom Menu Design", price: 150 },
  { id: "premium-glass", name: "Premium Glassware", price: 300 },
];

const cocktailMenuOptions: CocktailMenuItem[] = [
  { id: "margarita", name: "Classic Margarita", image: "/images/cocktails/margarita.png" },
  { id: "old-fashioned", name: "Old Fashioned", image: "/images/cocktails/old-fashioned.png" },
  { id: "mojito", name: "Fresh Mint Mojito", image: "/images/cocktails/mojito.png" },
  { id: "negroni", name: "Classic Negroni", image: "/images/cocktails/negroni.png" },
  { id: "espresso-martini", name: "Espresso Martini", image: "/images/cocktails/espresso-martini.png" },
  { id: "whiskey-sour", name: "Whiskey Sour", image: "/images/cocktails/whiskey-sour.png" },
  { id: "aperol-spritz", name: "Aperol Spritz", image: "/images/cocktails/aperol-spritz.png" },
  { id: "moscow-mule", name: "Moscow Mule", image: "/images/cocktails/moscow-mule.png" },
  { id: "french-75", name: "French 75", image: "/images/cocktails/french-75.png" },
];

function buildCalendarDays(
  viewMonth: Date,
  earliestBookableDate: Date,
): CalendarDay[] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const days: CalendarDay[] = [];
  const firstDayOfWeek = firstDayOfMonth.getDay();
  for (let i = firstDayOfWeek; i > 0; i--) {
    const d = new Date(year, month, 1 - i);
    days.push({
      key: `prev-${d.getTime()}`,
      dayLabel: d.getDate(),
      isoDate: d.toISOString().slice(0, 10),
      isCurrentMonth: false,
      isBeforeLeadTime: d < earliestBookableDate,
    });
  }

  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const d = new Date(year, month, i);
    days.push({
      key: `curr-${d.getTime()}`,
      dayLabel: i,
      isoDate: d.toISOString().slice(0, 10),
      isCurrentMonth: true,
      isBeforeLeadTime: d < earliestBookableDate,
    });
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    days.push({
      key: `next-${d.getTime()}`,
      dayLabel: i,
      isoDate: d.toISOString().slice(0, 10),
      isCurrentMonth: false,
      isBeforeLeadTime: d < earliestBookableDate,
    });
  }

  return days;
}

const toMonthLabel = (date: Date) =>
  date.toLocaleString("en-US", { month: "long", year: "numeric" });

const monthOptions = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

export function BookingCalendarStep({
  busyDates = [],
}: {
  busyDates?: { date: string; eventType: string }[];
}) {
  const router = useRouter();

  const getEventInfo = (type: string) => {
    switch (type) {
      case "WEDDING":
        return { label: "Wedding", dotColor: "bg-[#A3B18A]" };
      case "BRAND":
        return { label: "Corporate", dotColor: "bg-[#8E9AAF]" };
      case "PRIVATE":
        return { label: "Private", dotColor: "bg-[#D4A373]" };
      default:
        return { label: type, dotColor: "bg-[#7C826F]" };
    }
  };

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const earliestBookableDate = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const minDate = new Date(now);
    minDate.setDate(now.getDate() + MIN_LEAD_DAYS);
    return minDate;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [viewMonth, setViewMonth] = useState<Date>(
    new Date(
      earliestBookableDate.getFullYear(),
      earliestBookableDate.getMonth(),
      1,
    ),
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [eventType, setEventType] = useState("");
  const [isEventTypeOpen, setIsEventTypeOpen] = useState(false);
  const eventTypeMenuRef = useRef<HTMLDivElement>(null);

  const [venueType, setVenueType] = useState<"INDOOR" | "OUTDOOR" | "">("");
  const [address, setAddress] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [hours, setHours] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const [selectedPackageId, setSelectedPackageId] = useState(packageOptions[0].id);
  const [selectedDrinkChoiceId, setSelectedDrinkChoiceId] = useState(packageOptions[0].drinkChoices[0].id);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [selectedCocktailMenus, setSelectedCocktailMenus] = useState<string[]>([]);
  const [customCocktailItems, setCustomCocktailItems] = useState<CocktailMenuItem[]>([]);
  const [customCocktailInput, setCustomCocktailInput] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!isSubmitted) return;
    const timer = window.setTimeout(() => {
      router.push("/");
    }, 60_000);
    return () => window.clearTimeout(timer);
  }, [isSubmitted, router]);

  const calendarDays = useMemo(
    () => buildCalendarDays(viewMonth, earliestBookableDate),
    [viewMonth, earliestBookableDate],
  );

  const canGoToPreviousMonth = true;
  const yearOptions = useMemo(
    () => Array.from({ length: 10 }, (_, index) => new Date().getFullYear() - 2 + index),
    [],
  );

  const guestCountNumber = Number(guestCount) > 0 ? Number(guestCount) : 0;
  const selectedPackage = packageOptions.find((option) => option.id === selectedPackageId) ?? packageOptions[0];
  const selectedDrinkChoice = selectedPackage.drinkChoices.find((c) => c.id === selectedDrinkChoiceId) ?? selectedPackage.drinkChoices[0];
  const totalCocktailSlots = selectedDrinkChoice.cocktails;

  const totalBase = selectedPackage.price + selectedDrinkChoice.price;
  const totalAddons = selectedAddonIds.reduce((sum, id) => {
    const addon = addonOptions.find((a) => a.id === id);
    return sum + (addon?.price ?? 0);
  }, 0);
  const estimatedTotal = totalBase + totalAddons;

  const isStep2Valid = !!eventType && !!venueType && !!address && !!guestCount && !!hours;
  const isStep4Valid = selectedCocktailMenus.length === totalCocktailSlots;
  const isStep5Valid = !!name && !!email && !!phone;

  const goToPreviousMonth = () => setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goToNextMonth = () => setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const applyMonthYear = (year: number, monthIndex: number) => {
    setViewMonth(new Date(year, monthIndex, 1));
    setIsPickerOpen(false);
  };

  const handleCreateBooking = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    const selectedCocktailNames = cocktailMenuOptions
      .filter((item) => selectedCocktailMenus.includes(item.id))
      .map((item) => item.name);

    const payload = {
      date: selectedDate,
      eventType: eventType as any,
      venueType: venueType as any,
      address,
      guestCount: guestCountNumber,
      drinkCount: 0,
      perDrinkPrice: 6,
      package: selectedPackage.name,
      cocktailNumber: totalCocktailSlots,
      hours: Number(hours),
      estimatedTotal,
      total: estimatedTotal,
      cocktails: selectedCocktailNames,
      name,
      email,
      phone,
      note,
    };

    const res = await createBookingAction(payload);
    setIsSubmitting(false);
    if (res.ok) setIsSubmitted(true);
    else setSubmitError(res.error || "Failed to create booking.");
  };

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
  };

  const toggleCocktailMenu = (id: string) => {
    setSelectedCocktailMenus((prev) => {
      if (prev.includes(id)) return prev.filter((m) => m !== id);
      if (prev.length < totalCocktailSlots) return [...prev, id];
      return prev;
    });
  };

  const sectionTitleClass = "text-xs font-bold tracking-[0.3em] uppercase text-[#7C826F]";
  const fieldClass = "w-full rounded-none border border-[#D6CAB7] bg-[#FDFCFB] px-4 py-3 text-sm focus:border-[#303520] focus:ring-1 focus:ring-[#303520] outline-none transition-all";
  const btnPrimary = "rounded-full bg-[#303520] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#7C826F] disabled:bg-[#E0D9C9] disabled:text-[#A19C90] disabled:cursor-not-allowed";
  const btnSecondary = "rounded-full border border-[#D6CAB7] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#303520] transition hover:bg-[#FDFCFB]";

  return (
    <main className={`${raleway.className} min-h-screen bg-[#FDFCFB] text-[#303520]`}>
      {/* 1. Header */}
      <header className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="flex items-center justify-between border-b border-[#D6CAB7]/30 pb-10">
          <Link href="/" className="inline-block transition hover:opacity-80">
            <Image src="/images/catalyst-bar-olive.png" alt="Catalyst Mobile Bar" width={160} height={34} className="h-auto w-[140px] md:w-[160px]" priority />
          </Link>
          <div className="text-right">
            <p className={sectionTitleClass}>Step {currentStep} / 5</p>
            <p className="mt-1 text-sm font-medium text-[#D6CAB7]">Reservation Process</p>
          </div>
        </div>
      </header>

      {/* 2. Step Heading */}
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-10 text-center md:pt-24">
        <h1 className="text-4xl font-light leading-tight tracking-tight md:text-7xl">
          {currentStep === 1 ? "Choose Your Date" :
           currentStep === 2 ? "Event Details" :
           currentStep === 3 ? "Select Package" :
           currentStep === 4 ? "Cocktail Menu" : "Final Summary"}
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[#7C826F]">
          {currentStep === 1 ? `Start your journey by selecting your preferred event date. Reservations open from ${MIN_LEAD_DAYS} days in advance.` :
           currentStep === 2 ? "Tell us more about your event flow and party size so we can prepare a tailored experience." :
           currentStep === 3 ? "Select the tier that best fits your guest list and desired service format." :
           currentStep === 4 ? `Choose up to ${totalCocktailSlots} signature drinks from our curated mixology collection.` :
           "Review your selections and provide your contact information to finalize the booking inquiry."}
        </p>
      </section>

      {/* 3. Main Content Area */}
      <div className="mx-auto max-w-5xl px-6 pb-32">
        {currentStep === 1 ? (
          <section className="rounded-sm border border-[#D6CAB7] bg-[#EAE8E4]/20 p-6 md:p-12 shadow-sm">
            <div className="mb-10 flex items-center justify-between">
              <button onClick={goToPreviousMonth} className="text-[10px] font-bold uppercase tracking-widest text-[#7C826F] hover:text-[#303520] transition">Prev Month</button>
              <button onClick={() => setIsPickerOpen(!isPickerOpen)} className="text-lg font-light tracking-tight hover:text-[#7C826F] transition">
                {toMonthLabel(viewMonth)}
              </button>
              <button onClick={goToNextMonth} className="text-[10px] font-bold uppercase tracking-widest text-[#7C826F] hover:text-[#303520] transition">Next Month</button>
            </div>

            {isPickerOpen && (
              <div className="mb-10 rounded-sm border border-[#D6CAB7] bg-white p-6 shadow-xl animate-in fade-in slide-in-from-top-2">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#D6CAB7]">Select Year</p>
                <div className="grid grid-cols-5 gap-2 mb-8">
                  {yearOptions.map(y => (
                    <button key={y} onClick={() => setViewMonth(new Date(y, viewMonth.getMonth(), 1))} className={`rounded-full py-2 text-xs transition ${y === viewMonth.getFullYear() ? "bg-[#303520] text-white" : "hover:bg-[#EAE8E4]"}`}>{y}</button>
                  ))}
                </div>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#D6CAB7]">Select Month</p>
                <div className="grid grid-cols-4 gap-2">
                  {monthOptions.map((m, i) => (
                    <button key={m} onClick={() => applyMonthYear(viewMonth.getFullYear(), i)} className={`rounded-full py-2 text-xs transition ${i === viewMonth.getMonth() ? "bg-[#303520] text-white" : "hover:bg-[#EAE8E4]"}`}>{m.slice(0,3)}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-7 gap-px bg-[#D6CAB7]/30 border border-[#D6CAB7]/30">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="bg-[#FDFCFB] py-4 text-center text-[10px] font-bold uppercase tracking-widest text-[#D6CAB7]">{d}</div>
              ))}
              {calendarDays.map((day) => {
                const isSelected = selectedDate === day.isoDate;
                const busyDay = busyDates.find((b) => b.date === day.isoDate);
                const isBusy = !!busyDay;
                const disabled = day.isBeforeLeadTime || isBusy;
                const eventInfo = isBusy ? getEventInfo(busyDay.eventType) : null;

                return (
                  <button
                    key={day.key}
                    disabled={disabled}
                    onClick={() => setSelectedDate(day.isoDate)}
                    className={`relative flex aspect-square flex-col items-center justify-center transition-all ${
                      isSelected ? "bg-[#303520] text-white z-10 scale-[1.02] shadow-lg" :
                      isBusy ? "bg-[#EAE8E4]/50 text-[#D6CAB7] cursor-not-allowed" :
                      day.isCurrentMonth ? "bg-[#FDFCFB] text-[#303520] hover:bg-[#EAE8E4]" : "bg-[#FDFCFB]/50 text-[#D6CAB7]"
                    } ${day.isBeforeLeadTime && !isBusy ? "opacity-30 cursor-not-allowed" : ""}`}
                  >
                    <span className="text-sm font-light">{day.dayLabel}</span>
                    {isBusy && (
                      <div className="absolute bottom-2 flex flex-col items-center gap-0.5">
                        <span className="block text-[6px] font-bold text-[#A19C90] uppercase tracking-tight leading-none md:text-[7px] md:tracking-tighter">Booked</span>
                        <div className="flex items-center gap-0.5 md:gap-1">
                          <div className={`hidden md:block h-1.5 w-1.5 rounded-full ${eventInfo?.dotColor}`} />
                          <span className="hidden font-bold tracking-tight text-[#7C826F] uppercase md:block md:text-[9px]">
                            {eventInfo?.label}
                          </span>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-12 flex flex-col items-center justify-between gap-6 md:flex-row border-t border-[#D6CAB7]/30 pt-10">
              <p className="text-sm text-[#7C826F]">
                {selectedDate ? <>Selected: <span className="font-semibold text-[#303520]">{new Date(selectedDate).toLocaleDateString('en-US', { dateStyle: 'long' })}</span></> : "No date selected"}
              </p>
              <button disabled={!selectedDate} onClick={() => setCurrentStep(2)} className={btnPrimary}>Continue to Details</button>
            </div>
          </section>
        ) : currentStep === 2 ? (
          <section className="space-y-12 rounded-sm border border-[#D6CAB7] bg-[#EAE8E4]/20 p-6 md:p-12">
            <div className="grid gap-10 md:grid-cols-2">
              <div className="space-y-6">
                <label className={sectionTitleClass}>Event Type</label>
                <select value={eventType} onChange={(e) => setEventType(e.target.value)} className={fieldClass}>
                  <option value="">Select event type...</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Corporate Event">Brand Activation</option>
                  <option value="Private Party">Private Party</option>
                </select>
              </div>
              <div className="space-y-6">
                <label className={sectionTitleClass}>Venue Style</label>
                <div className="flex gap-4">
                  {["INDOOR", "OUTDOOR"].map(v => (
                    <button key={v} onClick={() => setVenueType(v as any)} className={`flex-1 border py-3 text-xs font-bold tracking-widest uppercase transition ${venueType === v ? "border-[#303520] bg-[#303520] text-white" : "border-[#D6CAB7] bg-white text-[#7C826F] hover:border-[#303520]"}`}>{v}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-6 md:col-span-2">
                <label className={sectionTitleClass}>Venue Address</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full street address, city..." className={fieldClass} />
              </div>
              <div className="space-y-6">
                <label className={sectionTitleClass}>Guest Count</label>
                <input type="number" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} placeholder="Estimated guests" className={fieldClass} />
              </div>
              <div className="space-y-6">
                <label className={sectionTitleClass}>Service Hours</label>
                <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Desired hours" className={fieldClass} />
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-6 md:flex-row border-t border-[#D6CAB7]/30 pt-10">
              <button onClick={() => setCurrentStep(1)} className={btnSecondary}>Back to Calendar</button>
              <button disabled={!isStep2Valid} onClick={() => setCurrentStep(3)} className={btnPrimary}>Choose Package</button>
            </div>
          </section>
        ) : currentStep === 3 ? (
          <section className="space-y-12">
            <div className="grid gap-8 md:grid-cols-3">
              {packageOptions.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => {
                    setSelectedPackageId(pkg.id);
                    setSelectedDrinkChoiceId(pkg.drinkChoices[0].id);
                  }}
                  className={`relative flex flex-col h-full border p-8 text-left transition-all duration-500 ${
                    selectedPackageId === pkg.id ? "border-[#303520] bg-[#FDFCFB] shadow-2xl scale-[1.02]" : "border-[#D6CAB7] bg-[#EAE8E4]/20 opacity-70"
                  }`}
                >
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#7C826F] mb-4">Package</p>
                  <h3 className="text-3xl font-light mb-2">{pkg.name}</h3>
                  <p className="text-sm font-medium text-[#D6CAB7] mb-6">From ${pkg.price}</p>
                  <p className="text-sm leading-relaxed text-[#7C826F] flex-1">{pkg.description}</p>
                  {selectedPackageId === pkg.id && (
                    <div className="mt-8 space-y-4 animate-in fade-in duration-500">
                      <p className={sectionTitleClass}>Cocktail Selection</p>
                      {pkg.drinkChoices.map((c) => (
                        <div key={c.id} onClick={(e) => { e.stopPropagation(); setSelectedDrinkChoiceId(c.id); }} className={`flex cursor-pointer items-center justify-between border-b border-[#D6CAB7]/30 py-2 text-xs transition ${selectedDrinkChoiceId === c.id ? "text-[#303520] font-bold" : "text-[#7C826F]"}`}>
                          <span>{c.name}</span>
                          <span>{c.price > 0 ? `+$${c.price}` : "Incl."}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="rounded-sm border border-[#D6CAB7] bg-[#EAE8E4]/20 p-8">
              <p className={sectionTitleClass + " mb-8 text-center"}>Enhance Your Service</p>
              <div className="grid gap-4 md:grid-cols-3">
                {addonOptions.map((addon) => (
                  <button key={addon.id} onClick={() => toggleAddon(addon.id)} className={`flex items-center justify-between border px-6 py-4 transition ${selectedAddonIds.includes(addon.id) ? "border-[#303520] bg-[#303520] text-white" : "border-[#D6CAB7] bg-[#FDFCFB] text-[#7C826F]"}`}>
                    <span className="text-xs font-bold uppercase tracking-widest">{addon.name}</span>
                    <span className="text-xs">${addon.price}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-6 md:flex-row border-t border-[#D6CAB7]/30 pt-10">
              <button onClick={() => setCurrentStep(2)} className={btnSecondary}>Back to Details</button>
              <div className="text-center md:text-right">
                <p className="text-xs text-[#7C826F] uppercase tracking-widest mb-1">Est. Total</p>
                <p className="text-3xl font-light text-[#303520] mb-4">${estimatedTotal}</p>
                <button onClick={() => setCurrentStep(4)} className={btnPrimary}>Select Cocktails</button>
              </div>
            </div>
          </section>
        ) : currentStep === 4 ? (
          <section className="space-y-12">
            <div className="text-center mb-10">
              <p className={sectionTitleClass}>Selection Required</p>
              <h3 className="mt-2 text-2xl font-light">Choose {totalCocktailSlots} Signatures</h3>
              <p className="text-sm text-[#7C826F] mt-2">({selectedCocktailMenus.length} of {totalCocktailSlots} selected)</p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
              {cocktailMenuOptions.map((cocktail) => {
                const isSelected = selectedCocktailMenus.includes(cocktail.id);
                return (
                  <button
                    key={cocktail.id}
                    onClick={() => toggleCocktailMenu(cocktail.id)}
                    className={`group relative flex flex-col items-center border p-6 transition-all duration-500 ${
                      isSelected ? "border-[#303520] bg-[#303520] text-white shadow-xl scale-[1.05]" : "border-[#D6CAB7] bg-[#FDFCFB] hover:border-[#303520]"
                    }`}
                  >
                    <div className="relative mb-6 aspect-square w-full grayscale-[50%] group-hover:grayscale-0 transition-all">
                      <Image src={cocktail.image} alt={cocktail.name} fill className="object-contain" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-center">{cocktail.name}</span>
                    {isSelected && <div className="absolute top-3 right-3 h-4 w-4 rounded-full bg-white flex items-center justify-center text-[#303520] text-[10px]">✓</div>}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col items-center justify-between gap-6 md:flex-row border-t border-[#D6CAB7]/30 pt-10">
              <button onClick={() => setCurrentStep(3)} className={btnSecondary}>Back to Package</button>
              <button disabled={!isStep4Valid} onClick={() => setCurrentStep(5)} className={btnPrimary}>Review Summary</button>
            </div>
          </section>
        ) : (
          <section className="rounded-sm border border-[#D6CAB7] bg-[#FDFCFB] p-8 md:p-16 shadow-2xl">
            {isSubmitted ? (
              <div className="text-center py-20 animate-in fade-in zoom-in duration-700">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#303520] text-white text-3xl mb-8">✓</div>
                <h2 className="text-4xl font-light mb-6">Reservation Inquiry Sent</h2>
                <p className="text-lg text-[#7C826F] max-w-md mx-auto leading-relaxed">
                  Thank you for choosing Catalyst. Our team will review your event details and 
                  reach out within 24–48 hours to confirm availability.
                </p>
                <Link href="/" className="mt-12 inline-block text-xs font-bold tracking-widest uppercase border-b border-[#303520] pb-1">Return to Home</Link>
              </div>
            ) : (
              <div className="grid gap-16 md:grid-cols-2">
                <div className="space-y-12">
                  <div className="space-y-6">
                    <h3 className={sectionTitleClass}>Contact Information</h3>
                    <div className="grid gap-4">
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className={fieldClass} />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className={fieldClass} />
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className={fieldClass} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className={sectionTitleClass}>Additional Notes</h3>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything else we should know?" className={fieldClass + " min-h-[120px]"} />
                  </div>
                </div>

                <div className="bg-[#EAE8E4]/20 p-8 rounded-sm">
                  <h3 className={sectionTitleClass + " mb-8"}>Summary</h3>
                  <div className="space-y-6 text-sm">
                    <div className="flex justify-between border-b border-[#D6CAB7]/30 pb-4">
                      <span className="text-[#7C826F]">Date</span>
                      <span className="font-bold">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#D6CAB7]/30 pb-4">
                      <span className="text-[#7C826F]">Event</span>
                      <span className="font-bold">{eventType} ({hours}h)</span>
                    </div>
                    <div className="flex justify-between border-b border-[#D6CAB7]/30 pb-4">
                      <span className="text-[#7C826F]">Package</span>
                      <span className="font-bold">{selectedPackage.name}</span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#D6CAB7]">Cocktail Menu</span>
                      <ul className="text-xs space-y-1 text-[#7C826F]">
                        {cocktailMenuOptions.filter(m => selectedCocktailMenus.includes(m.id)).map(m => (
                          <li key={m.id}>· {m.name}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-6 mt-6 border-t border-[#303520]/10">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold uppercase tracking-widest">Est. Total</span>
                        <span className="text-4xl font-light">${estimatedTotal}</span>
                      </div>
                    </div>
                  </div>
                  
                  {submitError && <p className="mt-6 text-xs text-red-500 text-center">{submitError}</p>}
                  
                  <button
                    disabled={!isStep5Valid || isSubmitting}
                    onClick={handleCreateBooking}
                    className={btnPrimary + " w-full mt-10 shadow-xl"}
                  >
                    {isSubmitting ? "Processing..." : "Submit Reservation"}
                  </button>
                  <button onClick={() => setCurrentStep(4)} className="w-full mt-4 text-[10px] font-bold uppercase tracking-widest text-[#7C826F] hover:text-[#303520] transition">Modify Selections</button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      <footer className="border-t border-[#D6CAB7]/30 py-12 text-center bg-[#FDFCFB]">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A19C90]">
          © 2024 Catalyst Mobile Bar. Final pour, zero stress.
        </p>
      </footer>
    </main>
  );
}
