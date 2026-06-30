import React from "react";
import { Check } from "lucide-react";

export default function BookingStepper({ currentStep }) {
  const steps = [
    { id: 1, label: "Chọn phương tiện" },
    { id: 2, label: "Chọn thời gian" },
    { id: 3, label: "Chọn vị trí" },
    { id: 4, label: "Xác nhận" },
    { id: 5, label: "Thanh toán" }
  ];

  return (
    <div className="w-full py-4 mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-slate-100 z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-indigo-600 z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center bg-white px-2">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isCompleted 
                    ? "bg-indigo-600 text-white" 
                    : isCurrent 
                    ? "bg-indigo-100 border-2 border-indigo-600 text-indigo-700" 
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span className={`text-[10px] mt-2 font-semibold absolute top-8 whitespace-nowrap ${
                isCurrent ? "text-indigo-700" : isCompleted ? "text-slate-700" : "text-slate-400"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
