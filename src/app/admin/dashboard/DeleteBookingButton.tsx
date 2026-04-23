"use client";

import { useState } from "react";
import { deleteBookingAction } from "@/features/booking/actions";

type Props = {
  bookingId: number;
  bookingName: string;
};

export function DeleteBookingButton({ bookingId, bookingName }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const formData = new FormData();
    formData.append("id", String(bookingId));

    const result = await deleteBookingAction(null, formData);
    if (!result.ok) {
      alert(result.error);
      setIsDeleting(false);
      setShowModal(false);
    }
    // Success will trigger a page revalidate, so we don't need to manually close
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="rounded-full border border-[#C9A0A0] px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8B2E2E] transition hover:bg-[#FDF2F2]"
      >
        Delete
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#303520]/40 backdrop-blur-sm p-6 text-[#303520]">
          <div className="w-full max-w-md bg-[#FDFCF8] border border-[#D9D4C7] shadow-2xl p-8">
            <h3 className="text-lg font-semibold tracking-tight">Confirm Deletion</h3>
            <p className="mt-3 text-sm text-[#7C826F] leading-relaxed">
              Are you sure you want to remove the booking for <strong className="text-[#303520]">"{bookingName}"</strong>? 
              This will hide it from the dashboard, but the data will be preserved in the archive.
            </p>
            
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isDeleting}
                className="rounded-full border border-[#7C826F] px-5 py-2 text-xs font-medium text-[#7C826F] transition hover:bg-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-full bg-[#8B2E2E] px-5 py-2 text-xs font-medium text-white transition hover:bg-[#702424] disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Deleting...
                  </>
                ) : (
                  "Confirm Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
