"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBookingAction } from "@/features/booking/actions";
import {
  MIN_GUARANTEED_DRINK_COUNT,
  PER_DRINK_PRICE,
} from "@/features/booking/constants";

type CalendarDay = {
  key: string;
  dayLabel: string;
  isoDate: string;
  isCurrentMonth: boolean;
  isBeforeLeadTime: boolean;
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MIN_LEAD_DAYS = 20;
const monthOptions = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const packageOptions = [
  {
    id: "standard",
    name: "Dry hire Package",
    guestLabel: "",
    basePrice: 1000,
    drinkChoices: [
      {
        id: "standard-base",
        label: "Dry hire",
        totalPrice: 1000,
        includedCocktails: 0,
      },
    ],
  },
  {
    id: "premium",
    name: "All Inclusive Package",
    guestLabel: "",
    basePrice: 2000,
    drinkChoices: [
      {
        id: "premium-2-custom",
        label: "2 custom cocktails",
        totalPrice: 2000,
        includedCocktails: 2,
      },
      {
        id: "premium-4-custom",
        label: "4 custom cocktails",
        totalPrice: 2250,
        includedCocktails: 4,
      },
    ],
  },
] as const;

const dryHireIncludedItems = [
  "2 bartenders",
  "2 cocktails",
  "4 hours service",
  "Basic garnishes (dehydrated fruit slices)",
  "Mixers (soda, juice) and Ice",
  "Disposable cups, straws, napkins",
  "Portable bar setup and supplies",
  "Setup and Take Down",
] as const;

const baseCocktailMenuOptions = [
  {
    id: "espresso-martini",
    name: "Espresso Martini",
    image: "/images/cocktails/mock-1.svg",
  },
  {
    id: "old-fashioned",
    name: "Old Fashioned",
    image: "/images/cocktails/mock-2.svg",
  },
  { id: "negroni", name: "Negroni", image: "/images/cocktails/mock-3.svg" },
  { id: "margarita", name: "Margarita", image: "/images/cocktails/mock-4.svg" },
  {
    id: "whiskey-sour",
    name: "Whiskey Sour",
    image: "/images/cocktails/mock-5.svg",
  },
  {
    id: "aperol-spritz",
    name: "Aperol Spritz",
    image: "/images/cocktails/mock-6.svg",
  },
  { id: "paloma", name: "Paloma", image: "/images/cocktails/mock-7.svg" },
  {
    id: "cosmopolitan",
    name: "Cosmopolitan",
    image: "/images/cocktails/mock-8.svg",
  },
] as const;

type CocktailMenuItem = {
  id: string;
  name: string;
  image: string;
};

function toMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function toIsoDate(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
}

function toReadableDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function buildCalendarDays(
  baseMonth: Date,
  earliestBookableDate: Date,
): CalendarDay[] {
  const monthStart = new Date(baseMonth.getFullYear(), baseMonth.getMonth(), 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);

    const isBeforeLeadTime = day < earliestBookableDate;

    return {
      key: `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`,
      dayLabel: String(day.getDate()),
      isoDate: toIsoDate(day),
      isCurrentMonth: day.getMonth() === baseMonth.getMonth(),
      isBeforeLeadTime,
    };
  });
}

export function BookingCalendarStep() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const earliestBookableDate = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const minDate = new Date(now);
    minDate.setDate(minDate.getDate() + MIN_LEAD_DAYS);
    return minDate;
  }, []);

  const [viewMonth, setViewMonth] = useState(
    () =>
      new Date(
        earliestBookableDate.getFullYear(),
        earliestBookableDate.getMonth(),
        1,
      ),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [eventType, setEventType] = useState("Wedding");
  const [isEventTypeOpen, setIsEventTypeOpen] = useState(false);
  const [venueAddress, setVenueAddress] = useState("");
  const [venueType, setVenueType] = useState<"Indoor" | "Outdoor">("Indoor");
  const [guestCount, setGuestCount] = useState("");
  const [selectedPackageId, setSelectedPackageId] =
    useState<(typeof packageOptions)[number]["id"]>("standard");
  const [selectedDrinkChoiceId, setSelectedDrinkChoiceId] =
    useState<string>("standard-2-custom");
  const [additionalCocktails, setAdditionalCocktails] = useState(0);
  const [additionalDrinks, setAdditionalDrinks] = useState(
    String(MIN_GUARANTEED_DRINK_COUNT),
  );
  const [extraHours, setExtraHours] = useState(0);
  const [customCocktailInput, setCustomCocktailInput] = useState("");
  const [customCocktailItems, setCustomCocktailItems] = useState<
    CocktailMenuItem[]
  >([]);
  const [selectedCocktailMenus, setSelectedCocktailMenus] = useState<string[]>(
    [],
  );
  const [contactFirstName, setContactFirstName] = useState("");
  const [contactLastName, setContactLastName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactNote, setContactNote] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedName, setSubmittedName] = useState("");
  const eventTypeMenuRef = useRef<HTMLDivElement | null>(null);

  const calendarDays = useMemo(
    () => buildCalendarDays(viewMonth, earliestBookableDate),
    [viewMonth, earliestBookableDate],
  );
  const canGoToPreviousMonth =
    viewMonth.getFullYear() > earliestBookableDate.getFullYear() ||
    (viewMonth.getFullYear() === earliestBookableDate.getFullYear() &&
      viewMonth.getMonth() > earliestBookableDate.getMonth());
  const yearOptions = useMemo(
    () =>
      Array.from(
        { length: 6 },
        (_, index) => earliestBookableDate.getFullYear() + index,
      ),
    [earliestBookableDate],
  );
  const guestCountNumber = Number(guestCount) > 0 ? Number(guestCount) : 0;
  const selectedPackage =
    packageOptions.find((option) => option.id === selectedPackageId) ??
    packageOptions[0];
  const selectedDrinkChoice =
    selectedPackage.drinkChoices.find(
      (choice) => choice.id === selectedDrinkChoiceId,
    ) ?? selectedPackage.drinkChoices[0];
  const additionalDrinksCount = Math.max(
    MIN_GUARANTEED_DRINK_COUNT,
    Number(additionalDrinks || "0"),
  );
  const drinksPerGuest =
    guestCountNumber > 0 ? additionalDrinksCount / guestCountNumber : null;
  const drinkTypeLabel =
    selectedPackageId === "standard"
      ? "Not included"
      : selectedDrinkChoice.label;
  const totalCocktailSlots =
    selectedDrinkChoice.includedCocktails + additionalCocktails;
  const additionalCocktailsTotal =
    selectedPackageId === "premium"
      ? additionalCocktails * 250
      : additionalCocktails * 250;
  const additionalDrinksTotal =
    selectedPackageId === "premium" ? additionalDrinksCount * PER_DRINK_PRICE : 0;
  const extraHoursTotal =
    selectedPackageId === "premium" ? extraHours * 250 : extraHours * 250;
  const hoursTotal = 4 + extraHours;
  const estimatedTotal =
    selectedPackageId === "premium"
      ? additionalDrinksCount * PER_DRINK_PRICE +
        additionalCocktailsTotal +
        extraHoursTotal
      : selectedDrinkChoice.totalPrice +
        additionalCocktailsTotal +
        additionalDrinksTotal +
        extraHoursTotal;
  const allInclusiveIncludedItems = [
    `${additionalDrinksCount} Drinks Guaranteed`,
    "Liquor Included (Vodka, Gin, Tequila, Whiskey, etc.)",
    "Special Event Permit (SEP) Handling",
    "2 to 4 Professional bartenders",
    "2 cocktails",
    "4 hours service",
    "Basic garnishes (dehydrated fruit slices)",
    "Mixers (Soda, Juice, House-made Syrups) and Ice",
    "Disposable Cups, Straws, Napkins",
    "Portable Bar Setup and Supplies",
    "Setup and Take Down",
  ];
  const includedItems =
    selectedPackageId === "premium"
      ? allInclusiveIncludedItems
      : dryHireIncludedItems;
  const cocktailMenuOptions: CocktailMenuItem[] = [
    ...baseCocktailMenuOptions,
    ...customCocktailItems,
  ];
  const isStep2Valid = Boolean(
    eventType && venueAddress.trim() && guestCountNumber > 0,
  );
  const contactFullName = `${contactFirstName.trim()} ${contactLastName.trim()}`.trim();
  const isStep5Valid = Boolean(
    contactFirstName.trim() &&
      contactLastName.trim() &&
      contactEmail.trim() &&
      contactPhone.trim(),
  );

  useEffect(() => {
    if (!isSubmitted) {
      return;
    }
    const timer = window.setTimeout(() => {
      router.push("/");
    }, 60_000);
    return () => window.clearTimeout(timer);
  }, [isSubmitted, router]);
  const selectedCocktailNames = cocktailMenuOptions
    .filter((item) => selectedCocktailMenus.includes(item.id))
    .map((item) => item.name);
  const stepHeading =
    currentStep === 1
      ? "Choose Your Event Date"
      : currentStep === 2
        ? "Tell Us About Your Event"
        : currentStep === 3
          ? "Choose Package & Add-ons"
          : currentStep === 4
            ? "Choose Your Cocktail Menu"
            : "Final Details & Summary";
  const stepDescription =
    currentStep === 1
      ? `Start your booking by selecting the preferred date. In the next step, we will collect your event details and guest information. Bookings open from at least ${MIN_LEAD_DAYS} days after today.`
      : currentStep === 2
        ? "Great choice. Enter your party details first, then we will move to package and cocktail selection."
        : currentStep === 3
          ? "Set your package, drink type, and add-ons first. Then select your custom cocktail menu."
          : currentStep === 4
            ? `You can select up to ${totalCocktailSlots} cocktails from the menu based on your package and add-ons.`
            : "Review the final estimate and share your contact details to complete the inquiry.";

  const goToPreviousMonth = () => {
    setViewMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setViewMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  const applyMonthYear = (year: number, monthIndex: number) => {
    const next = new Date(year, monthIndex, 1);
    const floor = new Date(
      earliestBookableDate.getFullYear(),
      earliestBookableDate.getMonth(),
      1,
    );
    setViewMonth(next < floor ? floor : next);
    setIsPickerOpen(false);
  };

  const addCustomCocktail = () => {
    const name = customCocktailInput.trim();
    if (!name) {
      return;
    }

    const nextItem: CocktailMenuItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      image: "/images/cocktails/cocktail-placeholder.svg",
    };

    setCustomCocktailItems((prev) => [...prev, nextItem]);
    setCustomCocktailInput("");
  };

  useEffect(() => {
    if (!isEventTypeOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (!eventTypeMenuRef.current) {
        return;
      }
      if (!eventTypeMenuRef.current.contains(event.target as Node)) {
        setIsEventTypeOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsEventTypeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isEventTypeOpen]);

  return (
    <main className="min-h-dvh bg-[#EAE8E4] px-6 py-6 text-[#303520] md:px-10 md:py-8">
      <section className="mx-auto mb-2 flex w-full max-w-5xl">
        <Link
          href="/"
          aria-label="Go to home"
          className="inline-flex items-center"
        >
          <Image
            src="/images/catalyst-logo.svg"
            alt="The Catalyst Mobile Bar"
            width={140}
            height={30}
            className="h-auto w-[140px]"
            priority
          />
        </Link>
      </section>

      <section className="mx-auto flex max-w-5xl flex-col">
        <p className="mb-3 text-xs tracking-[0.24em] uppercase text-[#7C826F]">
          Booking Step {currentStep} of 5
        </p>
        <h1 className="text-3xl leading-tight font-semibold md:text-5xl">
          {stepHeading}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#7C826F] md:text-base">
          {stepDescription}
        </p>
      </section>

      {currentStep === 1 ? (
        <section className="relative mx-auto mt-8 w-full max-w-5xl rounded-2xl border border-[#C8C1B0] bg-[#F7F5F0] p-5 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={goToPreviousMonth}
              disabled={!canGoToPreviousMonth}
              className={`rounded-md border border-[#C8C1B0] px-3 py-2 text-xs text-[#6B7360] transition ${
                canGoToPreviousMonth
                  ? "hover:bg-[#E4DFD6]"
                  : "cursor-not-allowed opacity-35 hover:bg-transparent"
              }`}
            >
              Previous
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPickerOpen((prev) => !prev)}
                className="rounded-md border border-[#C8C1B0] px-3 py-2 text-sm font-medium text-[#303520] transition hover:bg-[#E4DFD6] md:text-base"
              >
                {toMonthLabel(viewMonth)}
              </button>

              {isPickerOpen ? (
                <div className="absolute top-12 left-1/2 z-20 w-64 -translate-x-1/2 rounded-lg border border-[#C8C1B0] bg-[#F7F5F0] p-3 shadow-2xl">
                  <div className="grid gap-3">
                    <p className="text-xs text-[#7C826F]">Year</p>
                    <div className="grid grid-cols-3 gap-2">
                      {yearOptions.map((year) => {
                        const isActive = year === viewMonth.getFullYear();
                        return (
                          <button
                            key={year}
                            type="button"
                            onClick={() => {
                              const next = new Date(
                                year,
                                viewMonth.getMonth(),
                                1,
                              );
                              const floor = new Date(
                                earliestBookableDate.getFullYear(),
                                earliestBookableDate.getMonth(),
                                1,
                              );
                              setViewMonth(next < floor ? floor : next);
                            }}
                            className={`rounded-md border px-2 py-2 text-xs transition ${
                              isActive
                                ? "border-[#7C826F] bg-[#7C826F] text-white"
                                : "border-[#C8C1B0] text-[#6B7360] hover:bg-[#E4DFD6]"
                            }`}
                          >
                            {year}
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-xs text-[#7C826F]">Month</p>
                    <div className="grid grid-cols-3 gap-2">
                      {monthOptions.map((month, monthIndex) => {
                        const isActive = monthIndex === viewMonth.getMonth();
                        const isBlocked =
                          viewMonth.getFullYear() ===
                            earliestBookableDate.getFullYear() &&
                          monthIndex < earliestBookableDate.getMonth();

                        return (
                          <button
                            key={month}
                            type="button"
                            disabled={isBlocked}
                            onClick={() =>
                              applyMonthYear(
                                viewMonth.getFullYear(),
                                monthIndex,
                              )
                            }
                            className={`rounded-md border px-2 py-2 text-xs transition ${
                              isActive
                                ? "border-[#7C826F] bg-[#7C826F] text-white"
                                : "border-[#C8C1B0] text-[#6B7360] hover:bg-[#E4DFD6]"
                            } ${isBlocked ? "cursor-not-allowed opacity-35 hover:bg-transparent" : ""}`}
                          >
                            {month.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPickerOpen(false)}
                      className="mt-1 rounded-md border border-[#C8C1B0] px-3 py-2 text-xs text-[#6B7360] transition hover:bg-[#E4DFD6]"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={goToNextMonth}
              className="rounded-md border border-[#C8C1B0] px-3 py-2 text-xs text-[#6B7360] transition hover:bg-[#E4DFD6]"
            >
              Next
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs text-[#6B7360]">
            {weekdayLabels.map((label) => (
              <div key={label} className="py-2">
                {label}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const isSelected = selectedDate === day.isoDate;
              const disabled = day.isBeforeLeadTime;

              return (
                <button
                  key={day.key}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedDate(day.isoDate)}
                  className={`aspect-square rounded-md border text-sm transition ${
                    isSelected
                      ? "border-[#7C826F] bg-[#7C826F] text-white"
                      : day.isCurrentMonth
                        ? "border-[#C8C1B0] bg-[#FBFAF7] text-[#303520] hover:bg-[#E4DFD6]"
                        : "border-[#DDD6C7] bg-[#F1EDE5] text-[#A19C90]"
                  } ${disabled ? "cursor-not-allowed opacity-40 hover:bg-[#F1EDE5]" : ""}`}
                >
                  {day.dayLabel}
                </button>
              );
            })}
          </div>

          <div className="mt-7 flex flex-col gap-4 border-t border-[#C8C1B0] pt-5 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-[#6B7360]">
              {selectedDate ? (
                <>
                  Selected date:{" "}
                  <span className="font-medium text-[#303520]">
                    {toReadableDate(selectedDate)}
                  </span>
                </>
              ) : (
                "Select a date to continue."
              )}
            </p>
            <button
              type="button"
              disabled={!selectedDate}
              onClick={() => setCurrentStep(2)}
              className={`rounded-md px-5 py-3 text-sm font-medium transition ${
                selectedDate
                  ? "bg-[#7C826F] text-white hover:bg-[#6B7360]"
                  : "cursor-not-allowed bg-[#E0D9C9] text-[#A19C90]"
              }`}
            >
              Next
            </button>
          </div>
        </section>
      ) : currentStep === 2 ? (
        <section className="mx-auto mt-8 w-full max-w-5xl rounded-2xl border border-[#D6CAB7] bg-[#FDFCF8] p-5 md:p-8">
          <div className="mb-6 text-sm text-[#7C826F]">
            Selected date:{" "}
            <span className="font-medium text-[#303520]">
              {selectedDate ? toReadableDate(selectedDate) : "-"}
            </span>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2 text-sm text-[#7C826F]">
              Event Type
              <div className="relative" ref={eventTypeMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsEventTypeOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-md border border-[#D6CAB7] bg-white px-3 py-2 text-left text-[#303520] outline-none transition focus:border-[#7C826F] focus:ring-2 focus:ring-[#7C826F]/30"
                >
                  <span>{eventType}</span>
                  <span className="text-[#7C826F]">
                    {isEventTypeOpen ? "▴" : "▾"}
                  </span>
                </button>

                {isEventTypeOpen ? (
                  <div className="absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-md border border-[#D6CAB7] bg-[#FDFCF8] shadow-2xl">
                    {["Wedding", "Corporate Event", "Private Party"].map(
                      (option) => {
                        const isSelected = option === eventType;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setEventType(option);
                              setIsEventTypeOpen(false);
                            }}
                            className={`block w-full px-3 py-2 text-left text-sm transition ${
                              isSelected
                                ? "bg-[#7C826F] text-white"
                                : "text-[#303520] hover:bg-[#EFECE6]"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      },
                    )}
                  </div>
                ) : null}
              </div>
            </label>

            <label className="grid gap-2 text-sm text-[#7C826F]">
              Venue Address
              <input
                value={venueAddress}
                onChange={(event) => setVenueAddress(event.target.value)}
                placeholder="Street, city, postal code"
                className="rounded-md border border-[#C8C1B0] bg-white px-3 py-2 text-[#303520] placeholder:text-[#A19C90] shadow-sm focus:border-[#7C826F] focus:ring-2 focus:ring-[#7C826F]/20"
              />
            </label>

            <label className="grid gap-2 text-sm text-[#7C826F]">
              Indoor / Outdoor
              <div className="grid grid-cols-2 gap-2">
                {(["Indoor", "Outdoor"] as const).map((option) => {
                  const isSelected = venueType === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setVenueType(option)}
                      className={`rounded-md border px-3 py-2 text-sm transition ${
                        isSelected
                          ? "border-[#7C826F] bg-[#7C826F] text-white"
                          : "border-[#D6CAB7] bg-white text-[#303520] hover:bg-[#EFECE6]"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </label>

            <label className="grid gap-2 text-sm text-[#7C826F]">
              Guest Count
              <input
                type="number"
                min={1}
                value={guestCount}
                onChange={(event) => setGuestCount(event.target.value)}
                placeholder="e.g. 120"
                className="rounded-md border border-[#C8C1B0] bg-white px-3 py-2 text-[#303520] placeholder:text-[#A19C90] shadow-sm focus:border-[#7C826F] focus:ring-2 focus:ring-[#7C826F]/20"
              />
            </label>
          </div>

          <div className="mt-7 flex flex-col gap-3 border-t border-[#D6CAB7] pt-5 md:flex-row md:justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="rounded-md border border-[#D6CAB7] px-5 py-3 text-sm text-[#7C826F] transition hover:bg-[#EFECE6]"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!isStep2Valid}
              onClick={() => setCurrentStep(3)}
              className={`rounded-md px-5 py-3 text-sm font-medium transition ${
                isStep2Valid
                  ? "bg-[#7C826F] text-white hover:bg-[#6B7360]"
                  : "cursor-not-allowed bg-[#E0D9C9] text-[#A19C90]"
              }`}
            >
              Next
            </button>
          </div>
        </section>
      ) : currentStep === 3 ? (
        <section className="mx-auto mt-8 w-full max-w-5xl rounded-2xl border border-[#D6CAB7] bg-[#FDFCF8] p-5 md:p-8">
          <div className="grid items-start gap-6 md:grid-cols-2">
            <div className="flex flex-col md:sticky md:top-6">
              <h2 className="mb-3 text-lg font-medium">Package</h2>
              <div className="grid flex-1 gap-3">
                {packageOptions.map((pkg) => {
                  const selected = selectedPackageId === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => {
                        setSelectedPackageId(pkg.id);
                        setSelectedDrinkChoiceId(pkg.drinkChoices[0].id);
                      }}
                      className={`rounded-md border px-4 py-3 text-left transition ${
                        selected
                          ? "border-[#7C826F] bg-[#7C826F] text-white"
                          : "border-[#D6CAB7] bg-white text-[#303520] hover:bg-[#EFECE6]"
                      }`}
                    >
                      <p className="text-[15px] font-semibold">{pkg.name}</p>
                      {pkg.guestLabel ? (
                        <p className="text-xs opacity-80">{pkg.guestLabel}</p>
                      ) : null}
                      <p className="text-xs opacity-80">
                        {pkg.id === "premium"
                          ? `Starting from $1200 / $${PER_DRINK_PRICE} per drink`
                          : `Starting from $${pkg.basePrice}`}
                      </p>
                    </button>
                  );
                })}
              </div>
              {selectedPackageId === "premium" ? (
                <div className="mt-4 rounded-md border border-[#D6CAB7] bg-[#F7F5F0] p-3">
                  <p className="text-sm text-[#303520]">Drink Count</p>
                  <p className="mb-3 text-xs text-[#7C826F]">
                    ${PER_DRINK_PRICE} per drink (minimum{" "}
                    {MIN_GUARANTEED_DRINK_COUNT})
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={additionalDrinks}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (/^\d*$/.test(value)) {
                        setAdditionalDrinks(value);
                      }
                    }}
                    onBlur={() => {
                      if (
                        !additionalDrinks ||
                        Number(additionalDrinks) < MIN_GUARANTEED_DRINK_COUNT
                      ) {
                        setAdditionalDrinks(
                          String(MIN_GUARANTEED_DRINK_COUNT),
                        );
                      }
                    }}
                    className="w-full rounded-md border border-[#C8C1B0] bg-white px-3 py-2 text-sm text-[#303520] placeholder:text-[#A19C90] shadow-sm focus:border-[#7C826F] focus:ring-2 focus:ring-[#7C826F]/20"
                  />
                </div>
              ) : null}
            </div>
            <div className="flex flex-col">
              <h2 className="mb-3 text-lg font-medium">Add-ons</h2>
              {selectedPackageId === "premium" ? (
                <>
                  <div className="flex-1 rounded-md border border-[#D6CAB7] bg-[#F7F5F0] p-3">
                    <p className="text-sm text-[#303520]">
                      Additional cocktails
                    </p>
                    <p className="mb-3 text-xs text-[#7C826F]">
                      $250 per additional cocktail
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setAdditionalCocktails((prev) =>
                            Math.max(0, prev - 1),
                          )
                        }
                        className="rounded border border-[#D6CAB7] px-3 py-1 text-sm text-[#7C826F] hover:bg-[#EFECE6]"
                      >
                        -
                      </button>
                      <span className="min-w-8 text-center text-sm text-[#303520]">
                        {additionalCocktails}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setAdditionalCocktails((prev) => prev + 1)
                        }
                        className="rounded border border-[#D6CAB7] px-3 py-1 text-sm text-[#7C826F] hover:bg-[#EFECE6]"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 rounded-md border border-[#D6CAB7] bg-[#F7F5F0] p-3">
                    <p className="text-sm text-[#303520]">Additional hours</p>
                    <p className="mb-3 text-xs text-[#7C826F]">
                      $250 per extra hour
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExtraHours((prev) => Math.max(0, prev - 1))
                        }
                        className="rounded border border-[#D6CAB7] px-3 py-1 text-sm text-[#7C826F] hover:bg-[#EFECE6]"
                      >
                        -
                      </button>
                      <span className="min-w-8 text-center text-sm text-[#303520]">
                        {extraHours}
                      </span>
                      <button
                        type="button"
                        onClick={() => setExtraHours((prev) => prev + 1)}
                        className="rounded border border-[#D6CAB7] px-3 py-1 text-sm text-[#7C826F] hover:bg-[#EFECE6]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 rounded-md border border-[#D6CAB7] bg-[#F7F5F0] p-3">
                    <p className="text-sm text-[#303520]">
                      Additional cocktails
                    </p>
                    <p className="mb-3 text-xs text-[#7C826F]">
                      $250 per additional cocktail
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setAdditionalCocktails((prev) =>
                            Math.max(0, prev - 1),
                          )
                        }
                        className="rounded border border-[#D6CAB7] px-3 py-1 text-sm text-[#7C826F] hover:bg-[#EFECE6]"
                      >
                        -
                      </button>
                      <span className="min-w-8 text-center text-sm text-[#303520]">
                        {additionalCocktails}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setAdditionalCocktails((prev) => prev + 1)
                        }
                        className="rounded border border-[#D6CAB7] px-3 py-1 text-sm text-[#7C826F] hover:bg-[#EFECE6]"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 rounded-md border border-[#D6CAB7] bg-[#F7F5F0] p-3">
                    <p className="text-sm text-[#303520]">Additional hours</p>
                    <p className="mb-3 text-xs text-[#7C826F]">
                      $250 per extra hour
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExtraHours((prev) => Math.max(0, prev - 1))
                        }
                        className="rounded border border-[#D6CAB7] px-3 py-1 text-sm text-[#7C826F] hover:bg-[#EFECE6]"
                      >
                        -
                      </button>
                      <span className="min-w-8 text-center text-sm text-[#303520]">
                        {extraHours}
                      </span>
                      <button
                        type="button"
                        onClick={() => setExtraHours((prev) => prev + 1)}
                        className="rounded border border-[#D6CAB7] px-3 py-1 text-sm text-[#7C826F] hover:bg-[#EFECE6]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 hidden gap-6 md:grid md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm uppercase tracking-wide text-[#7C826F]">
                Includes
              </h3>
              <ul className="space-y-1 text-sm text-[#7C826F]">
                {includedItems.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm uppercase tracking-wide text-[#7C826F]">
                Host Requirements
              </h3>
              <ul className="space-y-1 text-sm text-[#7C826F]">
                {selectedPackageId === "premium" ? (
                  <>
                    <li>- Venue Information</li>
                    <li>- (No Liquor Purchase Required)</li>
                    <li>- (No Permit Application Required)</li>
                  </>
                ) : (
                  <>
                    <li>- Special Event Permit</li>
                    <li>- Liquor</li>
                    <li>- Venue Information</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#D6CAB7] bg-[#F7F5F0] p-4">
            {selectedPackageId === "premium" ? (
              <div className="text-[#303520]">
                <span className="text-sm font-medium">
                  Guaranteed Drink Count: {additionalDrinksCount},{" "}
                  {2 + additionalCocktails} Cocktails, {4 + extraHours} Hours.
                </span>
                <div className="mt-2 grid grid-cols-1 gap-3 text-sm font-medium text-[#303520] md:grid-cols-3 md:gap-4">
                  <div className="rounded-md border border-[#D6CAB7] bg-[#FBF9F4] p-3">
                    <span className="block text-xs tracking-wide text-[#7C826F]">
                      Per Drink / per person
                    </span>
                    <span className="block text-base font-semibold">
                      ${PER_DRINK_PRICE} /{" "}
                      {drinksPerGuest != null
                        ? Number.isInteger(drinksPerGuest)
                          ? drinksPerGuest
                          : drinksPerGuest.toFixed(1)
                        : "—"}{" "}
                      per person
                    </span>
                  </div>
                  <div className="rounded-md border border-[#D6CAB7] bg-[#FBF9F4] p-3">
                    <span className="block text-xs uppercase tracking-wide text-[#7C826F]">
                      Additional Cocktail
                    </span>
                    <span className="block text-base font-semibold">
                      ${250 * additionalCocktails}
                    </span>
                  </div>
                  <div className="rounded-md border border-[#D6CAB7] bg-[#FBF9F4] p-3">
                    <span className="block text-xs uppercase tracking-wide text-[#7C826F]">
                      Additional Hours
                    </span>
                    <span className="block text-base font-semibold">
                      ${250 * extraHours}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm font-medium text-[#303520]">
                Based on {selectedPackage.name} and add-ons.{" "}
                {guestCountNumber || 0} Guests. {2 + additionalCocktails}{" "}
                Cocktails. {hoursTotal} Hours.
              </p>
            )}
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-[#7C826F]">
                Estimated Total
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#303520]">
                ${estimatedTotal}{" "}
                <span className="text-xs font-normal text-[#7C826F]">
                  + tax
                </span>
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 border-t border-[#D6CAB7] pt-5 md:flex-row md:justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="rounded-md border border-[#D6CAB7] px-5 py-3 text-sm text-[#7C826F] transition hover:bg-[#EFECE6]"
            >
              Back
            </button>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="rounded-md bg-[#7C826F] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#6B7360] md:min-w-[190px]"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      ) : currentStep === 4 ? (
        <section className="mx-auto mt-8 w-full max-w-5xl rounded-2xl border border-[#D6CAB7] bg-[#FDFCF8] p-5 md:p-8">
          <div className="mb-5 rounded-md border border-[#D6CAB7] bg-[#F7F5F0] p-4 text-sm text-[#7C826F]">
            <p>
              Cocktail slots:{" "}
              <span className="font-medium text-[#303520]">
                {totalCocktailSlots}
              </span>
            </p>
            <p className="mt-1 text-xs text-[#7C826F]">
              Selected: {selectedCocktailMenus.length} / {totalCocktailSlots}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {cocktailMenuOptions.map((cocktail) => {
              const selected = selectedCocktailMenus.includes(cocktail.id);
              const atLimit =
                selectedCocktailMenus.length >= totalCocktailSlots;
              const disableNewSelection = !selected && atLimit;

              return (
                <button
                  key={cocktail.id}
                  type="button"
                  disabled={disableNewSelection}
                  onClick={() =>
                    setSelectedCocktailMenus((prev) =>
                      prev.includes(cocktail.id)
                        ? prev.filter((id) => id !== cocktail.id)
                        : [...prev, cocktail.id],
                    )
                  }
                  className={`overflow-hidden rounded-md border text-left transition ${
                    selected
                      ? "border-[#7C826F] bg-[#7C826F] text-white"
                      : "border-[#D6CAB7] bg-white text-[#303520] hover:bg-[#EFECE6]"
                  } ${disableNewSelection ? "cursor-not-allowed opacity-35 hover:bg-[#F7F5F0]" : ""}`}
                >
                  <div className="relative aspect-square w-full">
                    <Image
                      src={cocktail.image}
                      alt={cocktail.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="px-4 py-3">
                    <p className="font-medium">{cocktail.name}</p>
                    <p className="text-xs opacity-80">
                      {selected ? "Selected" : "Tap to select"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-md border border-[#D6CAB7] bg-[#F7F5F0] p-4">
            <p className="mb-2 text-sm text-[#303520]">
              Add custom cocktail requested by client
            </p>
            <div className="flex flex-col gap-2 md:flex-row">
              <input
                value={customCocktailInput}
                onChange={(event) => setCustomCocktailInput(event.target.value)}
                placeholder="e.g. Lychee Martini"
                className="w-full rounded-md border border-[#C8C1B0] bg-white px-3 py-2 text-sm text-[#303520] placeholder:text-[#A19C90] shadow-sm focus:border-[#7C826F] focus:ring-2 focus:ring-[#7C826F]/20"
              />
              <button
                type="button"
                onClick={addCustomCocktail}
                className="rounded-md border border-[#D6CAB7] px-4 py-2 text-sm text-[#7C826F] transition hover:bg-[#EFECE6]"
              >
                Add
              </button>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 border-t border-[#D6CAB7] pt-5 md:flex-row md:justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="rounded-md border border-[#D6CAB7] px-5 py-3 text-sm text-[#7C826F] transition hover:bg-[#EFECE6]"
            >
              Back
            </button>
            <button
              type="button"
              disabled={selectedCocktailMenus.length !== totalCocktailSlots}
              onClick={() => {
                if (selectedCocktailMenus.length === totalCocktailSlots) {
                  setCurrentStep(5);
                }
              }}
              className={`rounded-md px-5 py-3 text-sm font-medium transition ${
                selectedCocktailMenus.length === totalCocktailSlots
                  ? "bg-[#7C826F] text-white hover:bg-[#6B7360]"
                  : "cursor-not-allowed bg-[#E0D9C9] text-[#A19C90]"
              }`}
            >
              Next
            </button>
          </div>
        </section>
      ) : (
        <section className="mx-auto mt-8 w-full max-w-5xl rounded-2xl border border-[#D6CAB7] bg-[#FDFCF8] p-5 md:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-md border border-[#D6CAB7] bg-[#F7F5F0] p-4">
              <h2 className="text-lg font-medium text-[#303520]">
                Final Summary
              </h2>
              <div className="mt-3 space-y-2 text-sm text-[#7C826F]">
                <p>
                  Date:{" "}
                  <span className="text-[#303520]">
                    {selectedDate ? toReadableDate(selectedDate) : "-"}
                  </span>
                </p>
                <p>
                  Event: <span className="text-[#303520]">{eventType}</span>
                </p>
                <p>
                  Venue:{" "}
                  <span className="text-[#303520]">{venueAddress || "-"}</span>
                </p>
                <p>
                  Indoor/Outdoor:{" "}
                  <span className="text-[#303520]">{venueType}</span>
                </p>
                <p>
                  Guests:{" "}
                  <span className="text-[#303520]">
                    {guestCountNumber || 0}
                  </span>
                </p>
                <p>
                  Package:{" "}
                  <span className="text-[#303520]">{selectedPackage.name}</span>
                </p>
                {selectedPackageId === "premium" ? (
                  <p>
                    Drink Amount:{" "}
                    <span className="text-[#303520]">{additionalDrinksCount}</span>
                  </p>
                ) : null}
                <p>
                  Drink Type:{" "}
                  <span className="text-[#303520]">{drinkTypeLabel}</span>
                </p>
                <p>
                  Cocktail Menu:{" "}
                  <span className="text-[#303520]">
                    {selectedCocktailNames.length
                      ? selectedCocktailNames.join(", ")
                      : "-"}
                  </span>
                </p>
                <p className="pt-2 text-base font-semibold text-[#303520]">
                  Estimated Total: ${estimatedTotal}
                </p>
              </div>
            </div>

            {!isSubmitted ? (
              <div className="rounded-md border border-[#D6CAB7] bg-[#F7F5F0] p-4">
                <h2 className="text-lg font-medium text-[#303520]">
                  Contact Details
                </h2>
                <div className="mt-3 grid gap-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="grid gap-1 text-sm text-[#7C826F]">
                      First Name
                      <input
                        value={contactFirstName}
                        onChange={(event) =>
                          setContactFirstName(event.target.value)
                        }
                        className="rounded-md border border-[#C8C1B0] bg-white px-3 py-2 text-[#303520] placeholder:text-[#A19C90] shadow-sm focus:border-[#7C826F] focus:ring-2 focus:ring-[#7C826F]/20"
                        placeholder="First name"
                      />
                    </label>
                    <label className="grid gap-1 text-sm text-[#7C826F]">
                      Last Name
                      <input
                        value={contactLastName}
                        onChange={(event) =>
                          setContactLastName(event.target.value)
                        }
                        className="rounded-md border border-[#C8C1B0] bg-white px-3 py-2 text-[#303520] placeholder:text-[#A19C90] shadow-sm focus:border-[#7C826F] focus:ring-2 focus:ring-[#7C826F]/20"
                        placeholder="Last name"
                      />
                    </label>
                  </div>
                  <label className="grid gap-1 text-sm text-[#7C826F]">
                    Email
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(event) => setContactEmail(event.target.value)}
                      className="rounded-md border border-[#C8C1B0] bg-white px-3 py-2 text-[#303520] placeholder:text-[#A19C90] shadow-sm focus:border-[#7C826F] focus:ring-2 focus:ring-[#7C826F]/20"
                      placeholder="you@example.com"
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-[#7C826F]">
                    Phone Number
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(event) => setContactPhone(event.target.value)}
                      className="rounded-md border border-[#C8C1B0] bg-white px-3 py-2 text-[#303520] placeholder:text-[#A19C90] shadow-sm focus:border-[#7C826F] focus:ring-2 focus:ring-[#7C826F]/20"
                      placeholder="+1 604 000 0000"
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-[#7C826F]">
                    Note (Allergies / Requests)
                    <textarea
                      value={contactNote}
                      onChange={(event) => setContactNote(event.target.value)}
                      rows={4}
                      className="rounded-md border border-[#C8C1B0] bg-white px-3 py-2 text-[#303520] placeholder:text-[#A19C90] shadow-sm focus:border-[#7C826F] focus:ring-2 focus:ring-[#7C826F]/20"
                      placeholder="Share allergy info or special requests."
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-[#D6CAB7] bg-[#F7F5F0] p-4">
                <h2 className="text-lg font-medium text-[#303520]">
                  Thank you for your booking!
                </h2>
                <p className="mt-3 text-sm text-[#A8E3B5]">
                  {submittedName ? submittedName : "there"}! We will email you
                  within 24 hours.
                </p>
              </div>
            )}
          </div>

          {!isSubmitted ? (
            <div className="mt-7 flex flex-col gap-3 border-t border-[#D6CAB7] pt-5 md:flex-row md:justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="rounded-md border border-[#D6CAB7] px-5 py-3 text-sm text-[#7C826F] transition hover:bg-[#EFECE6]"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!isStep5Valid || isSubmitting || !selectedDate}
                onClick={async () => {
                  if (!selectedDate || isSubmitting) {
                    return;
                  }
                  setSubmitError(null);
                  setIsSubmitted(false);
                  setIsSubmitting(true);

                  const hoursTotal = 4 + extraHours;
                  const drinkCountForPayload =
                    selectedPackageId === "premium" ? additionalDrinksCount : 0;
                  const payload = {
                    date: selectedDate,
                    eventType,
                    address: venueAddress,
                    venueType,
                    guestCount: guestCountNumber,
                    drinkCount: drinkCountForPayload,
                    package: selectedPackageId,
                    cocktailNumber: totalCocktailSlots,
                    hours: hoursTotal,
                    estimatedTotal,
                    total: estimatedTotal,
                    cocktails: selectedCocktailNames,
                    name: contactFullName,
                    email: contactEmail,
                    phone: contactPhone,
                    note: contactNote,
                  };

                  const result = await createBookingAction(payload);
                  if (!result.ok) {
                    setSubmitError(result.error);
                    setIsSubmitting(false);
                    return;
                  }

                  setSubmittedName(contactFullName);
                  setContactFirstName("");
                  setContactLastName("");
                  setContactEmail("");
                  setContactPhone("");
                  setContactNote("");
                  setIsSubmitting(false);
                  setIsSubmitted(true);
                }}
                className={`rounded-md px-5 py-3 text-sm font-medium transition ${
                  isStep5Valid && !isSubmitting
                    ? "bg-[#7C826F] text-white hover:bg-[#6B7360]"
                    : "cursor-not-allowed bg-[#E0D9C9] text-[#A19C90]"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          ) : (
            <div className="mt-7 flex flex-col gap-3 border-t border-[#D6CAB7] pt-5 md:flex-row md:items-center md:justify-between">
              <Link
                href="/"
                className="rounded-md bg-[#7C826F] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#6B7360]"
              >
                Go to Home
              </Link>
            </div>
          )}

          {submitError && !isSubmitted ? (
            <p className="mt-4 text-sm text-[#F3A7A7]">{submitError}</p>
          ) : null}
        </section>
      )}
    </main>
  );
}
