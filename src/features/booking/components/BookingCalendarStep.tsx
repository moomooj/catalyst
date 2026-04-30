"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBookingAction } from "@/features/booking/actions";
import { Drink } from "@prisma/client";
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
        includedCocktails: 2,
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

type CocktailMenuItem = {
  id: string;
  name: string;
  image: string;
  alcoholTypes?: string[];
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

export function BookingCalendarStep({
  busyDates = [],
  drinks = [],
}: {
  busyDates?: { date: string; eventType: string }[];
  drinks?: Drink[];
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
    useState<string>("standard-base");
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
  const [alcoholFilter, setAlcoholFilter] = useState<string>("RECOMMEND");
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const alcoholLabels: Record<string, string> = {
    RECOMMEND: "Recommend",
    TEQUILA: "Tequila",
    VODKA: "Vodka",
    GIN: "Gin",
    RUM: "Rum",
    WHISKEY: "Whiskey",
    BUBBLY: "Bubbly",
  };

  const cocktailMenuOptions = useMemo(() => {
    const dbDrinks = drinks.map((d) => ({
      id: String(d.id),
      name: d.name,
      image: d.image,
      alcoholTypes: d.alcoholTypes as string[],
    }));
    return [...dbDrinks, ...customCocktailItems];
  }, [drinks, customCocktailItems]);

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
  const canGoToPreviousMonth = true;
  const yearOptions = useMemo(
    () =>
      Array.from(
        { length: 10 },
        (_, index) => new Date().getFullYear() - 2 + index,
      ),
    [],
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
    setViewMonth(new Date(year, monthIndex, 1));
    setIsPickerOpen(false);
  };

  const addCustomCocktail = () => {
    const name = customCocktailInput.trim();
    if (!name || selectedCocktailMenus.length >= totalCocktailSlots) {
      return;
    }

    const nextId = `custom-${Date.now()}`;
    const nextItem: CocktailMenuItem = {
      id: nextId,
      name,
      image: "/images/request-cocktail.jpg",
    };

    setCustomCocktailItems((prev) => [...prev, nextItem]);
    setSelectedCocktailMenus((prev) => [...prev, nextId]);
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
    <main className="min-h-dvh bg-[#FDFCFB] px-6 py-6 text-[#303520] md:px-10 md:py-8">
      <section className={`mx-auto flex w-full max-w-5xl transition-all duration-500 ${currentStep === 5 ? "justify-center mb-16" : "mb-2"}`}>
        <Link
          href="/"
          aria-label="Go to home"
          className="inline-flex items-center"
        >
          <Image
            src="/images/catalyst-bar-olive.png"
            alt="The Catalyst Mobile Bar"
            width={160}
            height={34}
            style={{ width: "auto", height: "auto" }}
            className="h-auto w-[140px] md:w-[160px]"
            priority
          />
        </Link>
      </section>

      {currentStep < 5 && (
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
      )}

      {currentStep === 1 ? (
        <section className="relative mx-auto mt-8 w-full max-w-5xl rounded-2xl border border-[#C8C1B0] bg-[#F7F5F0] p-5 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="rounded-md border border-[#C8C1B0] px-3 py-2 text-xs text-[#6B7360] transition hover:bg-[#E4DFD6]"
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
                              setViewMonth(new Date(year, viewMonth.getMonth(), 1));
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

                        return (
                          <button
                            key={month}
                            type="button"
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
                            }`}
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
              const busyDay = busyDates.find((b) => b.date === day.isoDate);
              const isBusy = !!busyDay;
              const disabled = day.isBeforeLeadTime || isBusy;
              const eventInfo = isBusy ? getEventInfo(busyDay.eventType) : null;

              return (
                <button
                  key={day.key}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedDate(day.isoDate)}
                  className={`aspect-square rounded-md border text-sm transition relative flex flex-col items-center justify-center ${
                    isSelected
                      ? "border-[#7C826F] bg-[#7C826F] text-white"
                      : isBusy
                        ? "cursor-not-allowed border-[#D6CAB7] bg-[#EAE8E4] text-[#A19C90] opacity-100"
                        : day.isCurrentMonth
                          ? "border-[#C8C1B0] bg-[#FBFAF7] text-[#303520] hover:bg-[#E4DFD6]"
                          : "border-[#DDD6C7] bg-[#F1EDE5] text-[#A19C90]"
                  } ${disabled && !isBusy ? "cursor-not-allowed opacity-40 hover:bg-[#F1EDE5]" : ""}`}
                >
                  <span className={isBusy ? "font-semibold" : ""}>
                    {day.dayLabel}
                  </span>
                  {isBusy && (
                    <div className="absolute bottom-1 flex flex-col items-center gap-0 md:bottom-1.5 md:gap-0.5">
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
                          ? `Starting from $1350 / $${PER_DRINK_PRICE} per drink`
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
                <div className="mt-2 grid grid-cols-2 gap-3 text-sm font-medium text-[#303520] md:grid-cols-4 md:gap-4">
                  <div className="rounded-md border border-[#D6CAB7] bg-[#FBF9F4] p-3">
                    <span className="block text-xs tracking-wide text-[#7C826F]">
                      Per Drink Price
                    </span>
                    <span className="block text-base font-semibold">
                      ${PER_DRINK_PRICE}
                    </span>
                  </div>
                  <div className="rounded-md border border-[#D6CAB7] bg-[#FBF9F4] p-3">
                    <span className="block text-xs tracking-wide text-[#7C826F]">
                      Est. Drinks
                    </span>
                    <span className="block text-base font-semibold">
                      {drinksPerGuest != null
                        ? Number.isInteger(drinksPerGuest)
                          ? `${drinksPerGuest} drinks`
                          : `${Math.floor(drinksPerGuest)}-${Math.ceil(drinksPerGuest)} drinks`
                        : "—"}{" "}
                      <span className="text-[10px] font-normal text-[#7C826F]">/ person</span>
                    </span>
                  </div>
                  <div className="rounded-md border border-[#D6CAB7] bg-[#FBF9F4] p-3">
                    <span className="block text-xs uppercase tracking-wide text-[#7C826F]">
                      Add-on Cocktail
                    </span>
                    <span className="block text-base font-semibold">
                      ${250 * additionalCocktails}
                    </span>
                  </div>
                  <div className="rounded-md border border-[#D6CAB7] bg-[#FBF9F4] p-3">
                    <span className="block text-xs uppercase tracking-wide text-[#7C826F]">
                      Add-on Hours
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
        <section className="mx-auto mt-4 w-full max-w-5xl rounded-none border border-[#D6CAB7] bg-[#FDFCFB] p-4 md:mt-8 md:p-10 shadow-sm">
          {/* Cocktail Slot Status */}
          <div className="mb-6 flex items-center justify-between border-b border-[#F5F2F0] pb-4 md:mb-8 md:pb-6">
             <div className="space-y-0.5">
               <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#B1AA9A]">Selected Menu</p>
               <p className="text-xs font-medium text-[#303520] md:text-sm">
                 {selectedCocktailMenus.length} / {totalCocktailSlots} Slots Used
               </p>
             </div>
             {selectedCocktailMenus.length >= totalCocktailSlots && (
               <span className="text-[8px] font-bold uppercase tracking-widest text-[#7C826F] bg-[#F7F5F0] px-2 py-0.5 border border-[#D6CAB7]">Full</span>
             )}
          </div>

          {/* Alcohol Category Tabs */}
          <div className="mb-6 flex flex-wrap gap-4 border-b border-[#D6CAB7]/30 md:mb-10 md:gap-6">
            {["RECOMMEND", "TEQUILA", "VODKA", "GIN", "RUM", "WHISKEY", "BUBBLY"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setAlcoholFilter(type)}
                className={`pb-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all duration-300 md:pb-4 md:text-xs ${
                  alcoholFilter === type
                    ? "border-[#7C826F] text-[#303520]"
                    : "border-transparent text-[#B1AA9A] hover:text-[#7C826F]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Cocktail Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 md:gap-6">
            {cocktailMenuOptions
              .filter(c => c.alcoholTypes?.includes(alcoholFilter))
              .map((cocktail) => {
                const isSelected = selectedCocktailMenus.includes(cocktail.id);
                const atLimit = selectedCocktailMenus.length >= totalCocktailSlots;
                const isDisabled = !isSelected && atLimit;

                return (
                  <button
                    key={cocktail.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() =>
                      setSelectedCocktailMenus((prev) =>
                        prev.includes(cocktail.id)
                          ? prev.filter((id) => id !== cocktail.id)
                          : [...prev, cocktail.id],
                      )
                    }
                    className={`group relative flex flex-col border transition-all duration-300 ${
                      isSelected
                        ? "border-[#7C826F] ring-1 ring-[#7C826F] shadow-md"
                        : "border-[#D6CAB7] bg-white hover:border-[#7C826F]"
                    } ${isDisabled ? "opacity-30 grayscale cursor-not-allowed" : ""}`}
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-[#F9F8F6]">
                      <Image
                        src={cocktail.image}
                        alt={cocktail.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#303520]/30 backdrop-blur-[0.5px]">
                          <div className="rounded-none bg-[#303520] p-1.5 text-white shadow-lg ring-1 ring-white/20">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className={`flex flex-1 flex-col p-2 transition-colors duration-300 ${isSelected ? "bg-[#7C826F]" : "bg-white"}`}>
                      <p className={`text-[9px] font-bold uppercase tracking-tight line-clamp-1 ${isSelected ? "text-white" : "text-[#303520]"}`}>
                        {cocktail.name}
                      </p>
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Your Selection Preview */}
          <div className="mt-10 border-t border-[#D6CAB7] pt-6 md:mt-16 md:pt-10">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#7C826F] mb-4 md:mb-8">Selection Preview</h3>
            {selectedCocktailMenus.length === 0 ? (
              <p className="text-[10px] italic text-[#B1AA9A]">Please select from the menu above.</p>
            ) : (
              <div className="space-y-6 md:space-y-10">
                <div className="flex flex-wrap gap-2 md:gap-4">
                  {cocktailMenuOptions
                    .filter(c => selectedCocktailMenus.includes(c.id))
                    .map(c => (
                      <div key={`sel-${c.id}`} className="flex items-center gap-2 border border-[#D6CAB7] bg-white pr-2 pl-1 py-1 shadow-sm md:gap-4 md:pr-4 md:pl-2 md:py-2 animate-in fade-in slide-in-from-left-2">
                        <div className="relative h-6 w-6 overflow-hidden bg-[#F9F8F6] md:h-10 md:w-10">
                          <Image src={c.image} alt={c.name} fill className="object-cover" />
                        </div>
                        <span className="text-[9px] font-bold text-[#303520] md:text-[11px]">{c.name}</span>
                        <button 
                          type="button"
                          onClick={() => {
                            setSelectedCocktailMenus(prev => prev.filter(id => id !== c.id));
                            if (c.id.startsWith('custom-')) {
                              setCustomCocktailItems(prev => prev.filter(item => item.id !== c.id));
                            }
                          }}
                          className="ml-1 text-[#B1AA9A] hover:text-red-500 transition-colors md:ml-2"
                        >
                          <svg className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                </div>

                {/* Automatic Highball Additions */}
                <div className="space-y-2 md:space-y-4">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-[#B1AA9A] md:text-[10px]">Included Highballs</p>
                  <div className="flex flex-col gap-1">
                    {Array.from(new Set(
                      cocktailMenuOptions
                        .filter(c => selectedCocktailMenus.includes(c.id))
                        .flatMap(c => c.alcoholTypes || [])
                        .map(t => String(t).toUpperCase())
                        .filter(type => ["TEQUILA", "VODKA", "GIN", "RUM", "WHISKEY"].includes(type))
                    )).sort((a, b) => {
                      const order = ["TEQUILA", "VODKA", "GIN", "RUM", "WHISKEY"];
                      return order.indexOf(a) - order.indexOf(b);
                    }).map(type => (
                      <p key={`highball-${type}`} className="text-[9px] font-medium text-[#7C826F] italic md:text-[11px]">
                        + {alcoholLabels[type]} Highball
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Custom Cocktail Request Section */}
          <div className={`mt-8 border border-dashed p-5 transition-all duration-500 md:mt-12 md:p-8 ${
            selectedCocktailMenus.length >= totalCocktailSlots 
              ? "bg-[#F7F5F0] border-[#D6CAB7] opacity-60" 
              : "bg-[#FDFCFB] border-[#D6CAB7]"
          }`}>
            <div className="max-w-2xl">
              <h4 className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#B1AA9A] mb-3 transition-colors">
                {selectedCocktailMenus.length >= totalCocktailSlots 
                  ? "Maximum selection reached" 
                  : "Can't find what you're looking for?"}
              </h4>
              <div className="flex flex-col gap-2 sm:flex-row md:gap-4">
                <input
                  type="text"
                  disabled={selectedCocktailMenus.length >= totalCocktailSlots}
                  value={customCocktailInput}
                  onChange={(e) => setCustomCocktailInput(e.target.value)}
                  placeholder={selectedCocktailMenus.length >= totalCocktailSlots 
                    ? "Limit reached" 
                    : "Request custom (e.g. Lychee Martini)"}
                  className="flex-1 rounded-none border border-[#D6CAB7] bg-white px-4 py-2 text-xs focus:border-[#7C826F] focus:outline-none placeholder:text-[#B1AA9A] disabled:bg-transparent disabled:cursor-not-allowed"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCocktail())}
                />
                <button
                  type="button"
                  disabled={selectedCocktailMenus.length >= totalCocktailSlots || !customCocktailInput.trim()}
                  onClick={addCustomCocktail}
                  className="rounded-none bg-[#303520] px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-[#7C826F] disabled:bg-[#D6D5CE] disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
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
              onClick={() => setCurrentStep(5)}
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
          <div className="grid gap-6 lg:grid-cols-2">
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
                <p>
                  Drink Type:{" "}
                  <span className="text-[#303520]">{drinkTypeLabel}</span>
                </p>
                
                <div className="flex flex-col gap-2 pt-2">
                  <span className="text-[#7C826F]">Cocktail Menu:</span>
                  <div className="flex flex-col gap-1 pl-1">
                    {selectedCocktailNames.map(name => (
                      <p key={name} className="text-xs font-bold text-[#303520]">{name}</p>
                    ))}
                    {Array.from(new Set(
                      cocktailMenuOptions
                        .filter(c => selectedCocktailMenus.includes(c.id))
                        .flatMap(c => c.alcoholTypes || [])
                        .map(t => String(t).toUpperCase())
                        .filter(type => ["TEQUILA", "VODKA", "GIN", "RUM", "WHISKEY"].includes(type))
                    )).sort((a,b) => ["TEQUILA","VODKA","GIN","RUM","WHISKEY"].indexOf(a) - ["TEQUILA","VODKA","GIN","RUM","WHISKEY"].indexOf(b)).map(t => (
                      <p key={t} className="text-xs font-medium text-[#7C826F] italic">+ {alcoholLabels[t]} Highball</p>
                    ))}
                  </div>
                </div>

                <p className="pt-2 text-base font-semibold text-[#303520] border-t border-[#D6CAB7]/30 mt-4">
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
                  <div className="grid gap-3 lg:grid-cols-2">
                    <label className="grid gap-1 text-sm text-[#7C826F]">
                      First Name
                      <input
                        value={contactFirstName}
                        onChange={(event) => setContactFirstName(event.target.value)}
                        className="rounded-md border border-[#C8C1B0] bg-white px-3 py-2 text-[#303520] placeholder:text-[#A19C90] shadow-sm focus:border-[#7C826F] focus:ring-2 focus:ring-[#7C826F]/20"
                        placeholder="First name"
                      />
                    </label>
                    <label className="grid gap-1 text-sm text-[#7C826F]">
                      Last Name
                      <input
                        value={contactLastName}
                        onChange={(event) => setContactLastName(event.target.value)}
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
              <div className="rounded-md border border-[#D6CAB7] bg-[#F7F5F0] p-4 flex flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#A8E3B5] text-[#303520]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-lg font-medium text-[#303520]">Inquiry Received!</h2>
                <p className="mt-2 text-sm text-[#7C826F]">
                  Thank you, {submittedName || "there"}. We will review your details and get back to you within 24-48 hours.
                </p>
                <Link href="/" className="mt-6 text-xs font-bold uppercase tracking-widest text-[#7C826F] border-b border-[#7C826F]">Return Home</Link>
              </div>
            )}
          </div>

          {!isSubmitted && (
            <div className="mt-7 flex flex-col gap-4 border-t border-[#D6CAB7] pt-8 md:flex-row md:justify-between md:items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="rounded-md border border-[#D6CAB7] px-5 py-3 text-sm text-[#7C826F] transition hover:bg-[#EFECE6] shrink-0"
              >
                Back
              </button>

              <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row-reverse md:items-center md:gap-6">
                <button
                  type="button"
                  disabled={!isStep5Valid || isSubmitting || !selectedDate}
                  onClick={async () => {
                    if (!selectedDate || isSubmitting) return;
                    setSubmitError(null);
                    setIsSubmitting(true);

                    const hoursTotal = 4 + extraHours;
                    const payload = {
                      date: selectedDate,
                      eventType,
                      address: venueAddress,
                      venueType,
                      guestCount: guestCountNumber,
                      drinkCount: selectedPackageId === "premium" ? Number(additionalDrinks) : 0,
                      package: selectedPackageId,
                      cocktailNumber: totalCocktailSlots,
                      hours: hoursTotal,
                      estimatedTotal,
                      total: estimatedTotal,
                      cocktails: selectedCocktailNames,
                      name: `${contactFirstName} ${contactLastName}`.trim(),
                      email: contactEmail,
                      phone: contactPhone,
                      note: contactNote,
                    };

                    const result = await createBookingAction(null, payload);
                    if (!result.ok) {
                      setSubmitError(result.error);
                      setIsSubmitting(false);
                      return;
                    }

                    // 성공 시 전용 확인 페이지로 이동 (인증용 이메일 포함)
                    router.push(`/booking/confirmation/${result.data.id}?auth=${encodeURIComponent(contactEmail)}`);
                  }}
                  className={`w-full rounded-md px-8 py-3 text-sm font-medium transition md:w-auto ${
                    isStep5Valid && !isSubmitting
                      ? "bg-[#7C826F] text-white hover:bg-[#6B7360]"
                      : "cursor-not-allowed bg-[#E0D9C9] text-[#A19C90]"
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
                <p className="text-[10px] text-[#B1AA9A] leading-relaxed md:max-w-[280px] md:text-right">
                  By submitting this form, you agree to our{" "}
                  <Link href="/privacy" target="_blank" className="underline hover:text-[#7C826F] transition-colors">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/terms" target="_blank" className="underline hover:text-[#7C826F] transition-colors">
                    Terms of Service
                  </Link>.
                </p>
              </div>
            </div>
          )}

          {submitError && (
            <p className="mt-4 text-sm text-red-500 font-bold">{submitError}</p>
          )}
        </section>
      )}
    </main>
  );
}
