"use client";

import { useState } from "react";
import { sendCustomDepositInvoiceAction, sendFinalBalanceInvoiceAction } from "@/features/booking/actions";

type Props = {
  bookingId: number;
  totalWithTax: number;
  defaultDeposit: number;
  isPaid: boolean;
  isFinalPaid?: boolean;
};

export function EmailActions({ bookingId, totalWithTax, defaultDeposit, isPaid, isFinalPaid = false }: Props) {
  const [isSending, setIsSending] = useState(false);
  const [isSendingFinal, setIsSendingFinal] = useState(false);
  const [amount, setAmount] = useState(String(defaultDeposit));
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSendDeposit = async () => {
    if (isPaid) return;
    const numAmount = Number(amount);
    if (numAmount > totalWithTax) {
      setMessage({ type: "error", text: `Amount cannot exceed total ($${totalWithTax})` });
      return;
    }

    setIsSending(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("id", String(bookingId));
    formData.append("amount", String(numAmount));

    const result = await sendCustomDepositInvoiceAction(formData);
    if (result.ok) {
      setMessage({ type: "success", text: "Deposit invoice sent successfully!" });
    } else {
      setMessage({ type: "error", text: result.error });
    }
    setIsSending(false);
  };

  const handleSendFinal = async () => {
    if (!isPaid || isFinalPaid) return;
    
    setIsSendingFinal(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("id", String(bookingId));

    const result = await sendFinalBalanceInvoiceAction(formData);
    if (result.ok) {
      setMessage({ type: "success", text: "Final balance invoice sent successfully!" });
    } else {
      setMessage({ type: "error", text: result.error });
    }
    setIsSendingFinal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#7C826F]">
              Deposit Amount ($)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={isPaid ? "PAID" : amount}
              disabled={isPaid}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                const num = Number(val);
                if (num > totalWithTax) {
                  setAmount(String(totalWithTax));
                } else {
                  setAmount(val);
                }
              }}
              onBlur={() => {
                if (!amount || Number(amount) < 0) setAmount("0");
              }}
              placeholder="0"
              className="w-32 rounded-md border border-[#D9D4C7] bg-[#FDFCF8] px-3 py-2 text-sm focus:border-[#7C826F] focus:outline-none focus:ring-1 focus:ring-[#7C826F] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:bg-[#ECE8DD] disabled:text-[#7C826F]"
            />
          </div>
          <button
            onClick={handleSendDeposit}
            disabled={isSending || !amount || Number(amount) <= 0 || isPaid}
            className="rounded-full bg-[#7C826F] px-6 py-2 text-xs font-medium text-white transition hover:bg-[#6B7360] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPaid ? "Deposit Paid" : isSending ? "Sending..." : "Send Deposit Invoice"}
          </button>
        </div>
        {!isPaid && (
          <p className="text-[11px] text-[#7C826F]">
            * Defaults to 50% ({new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(defaultDeposit)}). Max limit: {new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(totalWithTax)}.
          </p>
        )}
      </div>

      {message && (
        <div className={`rounded-md px-4 py-2 text-xs font-medium ${
          message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap gap-3 border-t border-[#ECE8DD] pt-6">
        <button 
          onClick={handleSendFinal}
          disabled={!isPaid || isFinalPaid || isSendingFinal}
          className="rounded-full bg-[#7C826F] px-6 py-2 text-xs font-medium text-white transition hover:bg-[#6B7360] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFinalPaid ? "Final Balance Paid" : isSendingFinal ? "Sending..." : "Send Final Payment Link"}
        </button>
        <button className="rounded-full border border-[#7C826F] px-6 py-2 text-xs font-medium text-[#7C826F] opacity-50 cursor-not-allowed">
          Send Receipt
        </button>
      </div>
    </div>
  );
}
