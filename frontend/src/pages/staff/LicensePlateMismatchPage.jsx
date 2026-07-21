import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import LicensePlateInfo from "./components/LicensePlateInfo";
import LicensePlateMismatchForm from "./components/LicensePlateMismatchForm";
import { useLicensePlateMismatch } from "../../hooks/useLicensePlateMismatch";
import { useSubmitLicensePlateMismatch } from "../../hooks/useSubmitLicensePlateMismatch";

export default function LicensePlateMismatchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const parkingSessionId = location.state?.parkingSessionId;

  const { data: sessionData, isLoading: isFetching, isError, error } = useLicensePlateMismatch(parkingSessionId);
  const { mutate: submitMismatch, isPending: isSubmitting } = useSubmitLicensePlateMismatch();

  if (!parkingSessionId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-50">
        <AlertTriangle className="w-12 h-12 text-slate-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">No Parking Session Selected</h2>
        <p className="text-slate-500 mb-6 text-center max-w-md">
          You must select a parking session from the Exit Vehicle page to report a license plate mismatch.
        </p>
        <button
          onClick={() => navigate("/staff/exit")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Exit Vehicle
        </button>
      </div>
    );
  }

  const handleSubmit = (formData) => {
    submitMismatch(formData, {
      onSuccess: () => {
        navigate("/staff/exit");
      }
    });
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        <header className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">License Plate Mismatch</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Report vehicles whose actual license plate does not match the registered plate.
            </p>
          </div>
        </header>

        {isFetching ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
            <p className="font-bold text-slate-600">Loading session information...</p>
          </div>
        ) : isError ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 flex flex-col items-center justify-center text-rose-800">
            <AlertTriangle className="w-8 h-8 mb-3 text-rose-500" />
            <p className="font-bold mb-1">Failed to load session details</p>
            <p className="text-sm opacity-80">{error?.message || "An unexpected error occurred."}</p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300 slide-in-from-bottom-4">
            <LicensePlateInfo data={sessionData} />
            <LicensePlateMismatchForm
              parkingSessionId={parkingSessionId}
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
            />
          </div>
        )}
      </div>
    </div>
  );
}
