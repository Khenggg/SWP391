import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertTriangle, Send } from "lucide-react";

export default function LicensePlateMismatchForm({ parkingSessionId, onSubmit, isLoading }) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      actualPlate: "",
      reason: "",
    },
  });

  const handleFormSubmit = (data) => {
    onSubmit({
      sessionId: Number(parkingSessionId),
      exitPlateNumber: data.actualPlate,
      reason: data.reason,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-6">
      <div className="p-4 border-b border-slate-100 bg-amber-50/50 flex items-center gap-2 text-amber-800 font-bold">
        <AlertTriangle className="w-5 h-5" />
        <h3>Báo cáo lệch biển số</h3>
      </div>

      <div className="p-5 flex flex-col gap-6">
        <div>
          <label htmlFor="actualPlate" className="block text-sm font-bold text-slate-700 mb-1">
            Actual License Plate <span className="text-rose-500">*</span>
          </label>
          <input
            id="actualPlate"
            type="text"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
              errors.actualPlate ? "border-rose-500" : "border-slate-300"
            }`}
            placeholder="e.g. 30A12345"
            {...register("actualPlate", { required: "Actual License Plate is required." })}
          />
          {errors.actualPlate && (
            <p className="mt-1 text-sm text-rose-500 font-medium">{errors.actualPlate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-bold text-slate-700 mb-1">
            Reason <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="reason"
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none ${
              errors.reason ? "border-rose-500" : "border-slate-300"
            }`}
            placeholder="Provide a detailed reason..."
            {...register("reason", {
              required: "Reason is required.",
              minLength: {
                value: 10,
                message: "Reason must be at least 10 characters.",
              },
              maxLength: {
                value: 500,
                message: "Reason must not exceed 500 characters.",
              },
            })}
          />
          {errors.reason && (
            <p className="mt-1 text-sm text-rose-500 font-medium">{errors.reason.message}</p>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors shadow-sm disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Submit Request
        </button>
      </div>
    </form>
  );
}
