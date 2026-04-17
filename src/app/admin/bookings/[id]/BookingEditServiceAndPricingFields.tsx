"use client";

import { useState } from "react";
import {
  ALL_INCLUSIVE_MIN_COCKTAIL_COUNT,
  ALL_INCLUSIVE_MIN_HOURS,
  BOOKING_PACKAGE_ALL_INCLUSIVE,
  BOOKING_PACKAGE_DRY_HIRE,
  DRY_HIRE_BASE_PRICE,
  DRY_HIRE_COCKTAIL_UNIT_PRICE,
  DRY_HIRE_INCLUDED_COCKTAIL_COUNT,
  DRY_HIRE_HOUR_UNIT_PRICE,
  DRY_HIRE_MIN_COCKTAIL_COUNT,
  DRY_HIRE_MIN_HOURS,
  MIN_GUARANTEED_DRINK_COUNT,
  PER_DRINK_PRICE,
} from "@/features/booking/constants";

type CustomOption = {
  id: number;
  title: string;
  description: string;
  price: number;
};

type CustomTax = {
  id: number;
  title: string;
  percentage: number;
};

type Props = {
  sectionTitleClass: string;
  fieldClass: string;
  defaultPackageValue: string;
  guestCount: number;
  drinkCount: number;
  baselinePerDrinkPrice: number;
  cocktailNumber: number;
  hours: number;
  baselineEstimatedTotal: number;
  baselineTotal: number;
  defaultOptions?: Array<{ title: string; description: string; price: number }>;
  defaultTaxes?: Array<{ title: string; percentage: number }>;
};

/** Digits only; normalizes leading zeros via parseInt for display. */
function digitsToDisplayAndValue(raw: string): { display: string; n: number } {
  const d = raw.replace(/\D/g, "");
  if (d === "") {
    return { display: "", n: 0 };
  }
  const n = parseInt(d, 10);
  if (!Number.isFinite(n)) {
    return { display: "", n: 0 };
  }
  return { display: String(n), n };
}

export function BookingEditServiceAndPricingFields({
  sectionTitleClass,
  fieldClass,
  defaultPackageValue,
  guestCount,
  drinkCount: baselineDrinkCount,
  baselinePerDrinkPrice,
  cocktailNumber,
  hours,
  baselineEstimatedTotal,
  baselineTotal,
  defaultOptions = [],
  defaultTaxes = [],
}: Props) {
  const [packageValue, setPackageValue] = useState(defaultPackageValue);
  const showDrinkCount = packageValue === BOOKING_PACKAGE_ALL_INCLUSIVE;

  const [guestStr, setGuestStr] = useState(String(guestCount));
  const [drinkStr, setDrinkStr] = useState(String(baselineDrinkCount));
  const [perDrinkStr, setPerDrinkStr] = useState(
    String(baselinePerDrinkPrice > 0 ? baselinePerDrinkPrice : PER_DRINK_PRICE),
  );
  const [cocktailStr, setCocktailStr] = useState(String(cocktailNumber));
  const [hoursStr, setHoursStr] = useState(String(hours));
  const [optionTitle, setOptionTitle] = useState("");
  const [optionDescription, setOptionDescription] = useState("");
  const [optionPrice, setOptionPrice] = useState("");
  const [customOptions, setCustomOptions] = useState<CustomOption[]>(() =>
    defaultOptions.map((opt, i) => ({ ...opt, id: i })),
  );
  const [taxTitle, setTaxTitle] = useState("");
  const [taxPercentage, setTaxPercentage] = useState("");
  const [customTaxes, setCustomTaxes] = useState<CustomTax[]>(() =>
    defaultTaxes.map((tax, i) => ({ ...tax, id: i })),
  );

  const guestNum = (() => {
    const { n } = digitsToDisplayAndValue(guestStr);
    return n;
  })();
  const drinkNum = (() => {
    const { n } = digitsToDisplayAndValue(drinkStr);
    return n;
  })();
  const perDrinkNum = (() => {
    const { n } = digitsToDisplayAndValue(perDrinkStr);
    return n;
  })();
  const cocktailNum = (() => {
    const { n } = digitsToDisplayAndValue(cocktailStr);
    return n;
  })();
  const hoursNum = (() => {
    const { n } = digitsToDisplayAndValue(hoursStr);
    return n;
  })();

  const safeDrink =
    packageValue === BOOKING_PACKAGE_ALL_INCLUSIVE
      ? Math.max(MIN_GUARANTEED_DRINK_COUNT, drinkNum)
      : Math.max(0, drinkNum);
  const safePerDrink = Math.min(
    999,
    Math.max(PER_DRINK_PRICE, perDrinkNum || PER_DRINK_PRICE),
  );

  const safeCocktail =
    packageValue === BOOKING_PACKAGE_DRY_HIRE
      ? Math.max(DRY_HIRE_MIN_COCKTAIL_COUNT, cocktailNum)
      : packageValue === BOOKING_PACKAGE_ALL_INCLUSIVE
        ? Math.max(ALL_INCLUSIVE_MIN_COCKTAIL_COUNT, cocktailNum)
        : Math.max(0, cocktailNum);
  const safeHours =
    packageValue === BOOKING_PACKAGE_DRY_HIRE
      ? Math.max(DRY_HIRE_MIN_HOURS, hoursNum)
      : packageValue === BOOKING_PACKAGE_ALL_INCLUSIVE
        ? Math.max(ALL_INCLUSIVE_MIN_HOURS, hoursNum)
        : Math.max(1, hoursNum);
  const dryHireExtraCocktails = Math.max(
    0,
    safeCocktail - DRY_HIRE_INCLUDED_COCKTAIL_COUNT,
  );
  const dryHireExtraHours = Math.max(0, safeHours - DRY_HIRE_MIN_HOURS);
  const dryHireEstimated =
    DRY_HIRE_BASE_PRICE +
    dryHireExtraCocktails * DRY_HIRE_COCKTAIL_UNIT_PRICE +
    dryHireExtraHours * DRY_HIRE_HOUR_UNIT_PRICE;
  const allInclusiveEstimated =
    safeDrink * safePerDrink +
    Math.max(0, safeCocktail - ALL_INCLUSIVE_MIN_COCKTAIL_COUNT) *
      DRY_HIRE_COCKTAIL_UNIT_PRICE +
    Math.max(0, safeHours - ALL_INCLUSIVE_MIN_HOURS) * DRY_HIRE_HOUR_UNIT_PRICE;
  const displayEstimated =
    packageValue === BOOKING_PACKAGE_DRY_HIRE
      ? dryHireEstimated
      : allInclusiveEstimated;
  const optionTotal = customOptions.reduce((sum, option) => sum + option.price, 0);
  const subtotalWithOptions = displayEstimated + optionTotal;
  const taxTotal = customTaxes.reduce(
    (sum, tax) => sum + Math.round((subtotalWithOptions * tax.percentage) / 100),
    0,
  );
  const displayTotal = subtotalWithOptions + taxTotal;

  const handleAddOption = () => {
    const safeTitle = optionTitle.trim();
    const safeDescription = optionDescription.trim();
    const { n } = digitsToDisplayAndValue(optionPrice);
    const safePrice = Math.max(0, n);

    if (!safeTitle || safePrice <= 0) {
      return;
    }

    setCustomOptions((prev) => [
      ...prev,
      {
        id: Date.now() + prev.length,
        title: safeTitle,
        description: safeDescription,
        price: safePrice,
      },
    ]);
    setOptionTitle("");
    setOptionDescription("");
    setOptionPrice("");
  };
  const handleDeleteOption = (id: number) => {
    setCustomOptions((prev) => prev.filter((option) => option.id !== id));
  };
  const handleAddTax = () => {
    const safeTitle = taxTitle.trim() || "Tax";
    const { n } = digitsToDisplayAndValue(taxPercentage);
    const safePercentage = Math.max(0, n);

    if (safePercentage <= 0) {
      return;
    }

    setCustomTaxes((prev) => [
      ...prev,
      {
        id: Date.now() + prev.length,
        title: safeTitle,
        percentage: safePercentage,
      },
    ]);
    setTaxTitle("");
    setTaxPercentage("");
  };
  const handleDeleteTax = (id: number) => {
    setCustomTaxes((prev) => prev.filter((tax) => tax.id !== id));
  };

  return (
    <>
      <input
        type="hidden"
        name="options"
        value={JSON.stringify(
          customOptions.map(({ title, description, price }) => ({
            title,
            description,
            price,
          })),
        )}
      />
      <input
        type="hidden"
        name="taxes"
        value={JSON.stringify(
          customTaxes.map(({ title, percentage }) => ({ title, percentage })),
        )}
      />
      <div className="rounded-md border border-[#E0D9C9] bg-[#FDFCF8] p-5">
        <p className={sectionTitleClass}>Guest &amp; service</p>
        {!showDrinkCount ? (
          <>
            <input type="hidden" name="drinkCount" value={0} />
            <input type="hidden" name="perDrinkPrice" value={safePerDrink} />
          </>
        ) : null}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-[#303520]">
            Guest count
            <input
              type="text"
              name="guestCount"
              inputMode="numeric"
              autoComplete="off"
              value={guestStr}
              onChange={(event) => {
                const { display } = digitsToDisplayAndValue(event.target.value);
                setGuestStr(display);
              }}
              onBlur={() => {
                let n = guestNum;
                if (n < 1) {
                  n = 1;
                }
                setGuestStr(String(n));
              }}
              className={fieldClass}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#303520]">
            Package
            <select
              name="package"
              value={packageValue}
              onChange={(event) => setPackageValue(event.target.value)}
              className={fieldClass}
            >
              <option value={BOOKING_PACKAGE_DRY_HIRE}>Dry hire</option>
              <option value={BOOKING_PACKAGE_ALL_INCLUSIVE}>
                All inclusive
              </option>
            </select>
          </label>
          {showDrinkCount ? (
            <div className="grid gap-2 md:col-span-2">
              <p className="text-xs text-[#7C826F]">
                Per drink (CAD) — edits apply to this booking only. Catalog
                default is ${PER_DRINK_PRICE}.
              </p>
              <label className="grid gap-2 text-sm font-medium text-[#303520]">
                Per drink price (CAD)
                <input
                  type="text"
                  name="perDrinkPrice"
                  inputMode="numeric"
                  autoComplete="off"
                  value={perDrinkStr}
                  onChange={(event) => {
                    const { display } = digitsToDisplayAndValue(
                      event.target.value,
                    );
                    setPerDrinkStr(display);
                  }}
                  onBlur={() => {
                    const n =
                      perDrinkNum < PER_DRINK_PRICE
                        ? PER_DRINK_PRICE
                        : Math.min(999, perDrinkNum);
                    setPerDrinkStr(String(n));
                  }}
                  className={fieldClass}
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#303520]">
                Drink count
                <input
                  type="text"
                  name="drinkCount"
                  inputMode="numeric"
                  autoComplete="off"
                  value={drinkStr}
                  onChange={(event) => {
                    const { display } = digitsToDisplayAndValue(
                      event.target.value,
                    );
                    setDrinkStr(display);
                  }}
                  onBlur={() => {
                    if (packageValue === BOOKING_PACKAGE_ALL_INCLUSIVE) {
                      setDrinkStr(
                        String(Math.max(MIN_GUARANTEED_DRINK_COUNT, drinkNum)),
                      );
                      return;
                    }
                    setDrinkStr(String(Math.max(0, drinkNum)));
                  }}
                  className={fieldClass}
                />
              </label>
            </div>
          ) : null}
          <label className="grid gap-2 text-sm font-medium text-[#303520]">
            Cocktail count
            <input
              type="text"
              name="cocktailNumber"
              inputMode="numeric"
              autoComplete="off"
              value={cocktailStr}
              onChange={(event) => {
                const { display } = digitsToDisplayAndValue(event.target.value);
                setCocktailStr(display);
              }}
              onBlur={() => {
                if (packageValue === BOOKING_PACKAGE_DRY_HIRE) {
                  setCocktailStr(
                    String(Math.max(DRY_HIRE_MIN_COCKTAIL_COUNT, cocktailNum)),
                  );
                  return;
                }
                if (packageValue === BOOKING_PACKAGE_ALL_INCLUSIVE) {
                  setCocktailStr(
                    String(
                      Math.max(ALL_INCLUSIVE_MIN_COCKTAIL_COUNT, cocktailNum),
                    ),
                  );
                  return;
                }
                setCocktailStr(String(Math.max(0, cocktailNum)));
              }}
              className={fieldClass}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#303520]">
            Hours
            <input
              type="text"
              name="hours"
              inputMode="numeric"
              autoComplete="off"
              value={hoursStr}
              onChange={(event) => {
                const { display } = digitsToDisplayAndValue(event.target.value);
                setHoursStr(display);
              }}
              onBlur={() => {
                let n = hoursNum;
                if (packageValue === BOOKING_PACKAGE_DRY_HIRE) {
                  n = Math.max(DRY_HIRE_MIN_HOURS, n);
                } else if (packageValue === BOOKING_PACKAGE_ALL_INCLUSIVE) {
                  n = Math.max(ALL_INCLUSIVE_MIN_HOURS, n);
                } else if (n < 1) {
                  n = 1;
                }
                setHoursStr(String(n));
              }}
              className={fieldClass}
            />
          </label>
        </div>
      </div>

      <div className="rounded-md border border-[#E0D9C9] bg-[#FDFCF8] p-5">
        <p className={sectionTitleClass}>Option</p>
        <p className="mt-2 text-xs text-[#7C826F]">
          Add a custom option item with title, description, and price.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-12">
          <label className="grid gap-2 text-sm font-medium text-[#303520] md:col-span-4">
            Title
            <input
              type="text"
              name="optionTitle"
              autoComplete="off"
              placeholder="e.g. Premium garnish package"
              value={optionTitle}
              onChange={(event) => setOptionTitle(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#303520] md:col-span-5">
            Description
            <textarea
              name="optionDescription"
              rows={1}
              placeholder="Describe what is included for this option."
              value={optionDescription}
              onChange={(event) => setOptionDescription(event.target.value)}
              className={`${fieldClass} resize-y`}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#303520] md:col-span-3">
            Price (CAD)
            <input
              type="text"
              name="optionPrice"
              inputMode="numeric"
              autoComplete="off"
              placeholder="0"
              value={optionPrice}
              onChange={(event) => {
                const { display } = digitsToDisplayAndValue(event.target.value);
                setOptionPrice(display);
              }}
              className={fieldClass}
            />
          </label>
          <div className="flex flex-wrap items-center gap-3 md:col-span-12">
            <button
              type="button"
              onClick={handleAddOption}
              className="rounded-full bg-[#7C826F] px-5 py-2 text-xs font-medium text-white transition hover:bg-[#6B7360]"
            >
              Add option
            </button>
            <p className="text-xs text-[#7C826F]">
              Option total:{" "}
              <span className="font-medium text-[#303520]">${optionTotal}</span>
            </p>
          </div>
          {customOptions.length > 0 ? (
            <div className="rounded-md border border-[#E0D9C9] bg-white px-4 py-3 md:col-span-12">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7C826F]">
                Added options
              </p>
              <div className="mt-3 space-y-3">
                {customOptions.map((option) => (
                  <div
                    key={option.id}
                    className="grid grid-cols-[1fr_auto] items-start gap-3 border-b border-[#ECE8DD] pb-2 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#303520]">
                        {option.title}
                      </p>
                      {option.description ? (
                        <p className="text-xs text-[#7C826F]">
                          {option.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#303520]">
                        ${option.price}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleDeleteOption(option.id)}
                        className="rounded-full border border-[#C9A0A0] px-3 py-1 text-[11px] font-medium text-[#8B2E2E] transition hover:bg-[#FDF2F2]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-md border border-[#E0D9C9] bg-[#FDFCF8] p-5">
        <p className={sectionTitleClass}>Tax</p>
        <p className="mt-2 text-xs text-[#7C826F]">
          Add a custom tax item with title and percentage.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-12">
          <label className="grid gap-2 text-sm font-medium text-[#303520] md:col-span-8">
            Title
            <input
              type="text"
              name="taxTitle"
              autoComplete="off"
              placeholder="e.g. GST/HST"
              value={taxTitle}
              onChange={(event) => setTaxTitle(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#303520] md:col-span-4">
            Percentage (%)
            <input
              type="text"
              name="taxPercentage"
              inputMode="numeric"
              autoComplete="off"
              placeholder="0"
              value={taxPercentage}
              onChange={(event) => {
                const { display } = digitsToDisplayAndValue(event.target.value);
                setTaxPercentage(display);
              }}
              className={fieldClass}
            />
          </label>
          <div className="flex flex-wrap items-center gap-3 md:col-span-12">
            <button
              type="button"
              onClick={handleAddTax}
              className="rounded-full bg-[#7C826F] px-5 py-2 text-xs font-medium text-white transition hover:bg-[#6B7360]"
            >
              Add tax
            </button>
            <p className="text-xs text-[#7C826F]">
              Tax total:{" "}
              <span className="font-medium text-[#303520]">${taxTotal}</span>
            </p>
          </div>
          {customTaxes.length > 0 ? (
            <div className="rounded-md border border-[#E0D9C9] bg-white px-4 py-3 md:col-span-12">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7C826F]">
                Added taxes
              </p>
              <div className="mt-3 space-y-3">
                {customTaxes.map((tax) => {
                  const lineAmount = Math.round(
                    (subtotalWithOptions * tax.percentage) / 100,
                  );
                  return (
                    <div
                      key={tax.id}
                      className="grid grid-cols-[1fr_auto] items-start gap-3 border-b border-[#ECE8DD] pb-2 last:border-b-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#303520]">
                          {tax.title}
                        </p>
                        <p className="text-xs text-[#7C826F]">{tax.percentage}%</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#303520]">
                          +${lineAmount}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleDeleteTax(tax.id)}
                          className="rounded-full border border-[#C9A0A0] px-3 py-1 text-[11px] font-medium text-[#8B2E2E] transition hover:bg-[#FDF2F2]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className="rounded-md border border-[#E0D9C9] bg-[#FDFCF8] p-5"
        key={`pricing-${packageValue}`}
      >
        <p className={sectionTitleClass}>Pricing</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {packageValue === BOOKING_PACKAGE_ALL_INCLUSIVE ? (
            <>
              <label className="grid gap-2 text-sm font-medium text-[#303520]">
                Estimated total (CAD)
                <input
                  type="text"
                  name="estimatedTotal"
                  readOnly
                  value={String(displayEstimated)}
                  className={`${fieldClass} cursor-not-allowed bg-[#EFECE6] text-[#303520]`}
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#303520]">
                Final price (CAD)
                <input
                  type="text"
                  name="total"
                  readOnly
                  value={String(displayTotal)}
                  className={`${fieldClass} cursor-not-allowed bg-[#EFECE6] text-[#303520]`}
                />
              </label>
              <p className="text-xs text-[#7C826F] md:col-span-2">
                All inclusive base includes {ALL_INCLUSIVE_MIN_COCKTAIL_COUNT}{" "}
                cocktails and {ALL_INCLUSIVE_MIN_HOURS} hours. Estimated total
                is drink count × per drink, plus $250 for each additional
                cocktail/hour above those minimums.
                <span className="font-medium text-[#303520]">
                  {safeDrink} × ${safePerDrink}
                </span>
                .
              </p>
              {optionTotal > 0 ? (
                <p className="text-xs text-[#7C826F] md:col-span-2">
                  Added options:{" "}
                  <span className="font-medium text-[#303520]">
                    +${optionTotal}
                  </span>
                </p>
              ) : null}
              {taxTotal > 0 ? (
                <p className="text-xs text-[#7C826F] md:col-span-2">
                  Added taxes:{" "}
                  <span className="font-medium text-[#303520]">+${taxTotal}</span>
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-xs text-[#7C826F] md:col-span-2">
                Dry hire uses base ${DRY_HIRE_BASE_PRICE}. Minimum{" "}
                {DRY_HIRE_MIN_COCKTAIL_COUNT} cocktails and {DRY_HIRE_MIN_HOURS}{" "}
                hours are required. Extra cocktail fee starts above{" "}
                {DRY_HIRE_INCLUDED_COCKTAIL_COUNT} cocktails (from the 3rd
                cocktail), and extra hour fee starts above {DRY_HIRE_MIN_HOURS}{" "}
                hours.
              </p>
              <label className="grid gap-2 text-sm font-medium text-[#303520]">
                Estimated total (CAD)
                <input
                  type="text"
                  name="estimatedTotal"
                  readOnly
                  value={String(displayEstimated)}
                  className={`${fieldClass} cursor-not-allowed bg-[#EFECE6] text-[#303520]`}
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#303520]">
                Final price (CAD)
                <input
                  type="text"
                  name="total"
                  readOnly
                  value={String(displayTotal)}
                  className={`${fieldClass} cursor-not-allowed bg-[#EFECE6] text-[#303520]`}
                />
              </label>
              {optionTotal > 0 ? (
                <p className="text-xs text-[#7C826F] md:col-span-2">
                  Added options:{" "}
                  <span className="font-medium text-[#303520]">
                    +${optionTotal}
                  </span>
                </p>
              ) : null}
              {taxTotal > 0 ? (
                <p className="text-xs text-[#7C826F] md:col-span-2">
                  Added taxes:{" "}
                  <span className="font-medium text-[#303520]">+${taxTotal}</span>
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </>
  );
}
