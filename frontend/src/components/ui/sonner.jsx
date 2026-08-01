import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="top-right"
      icons={{
        success: (
          <CircleCheckIcon className="size-5 text-emerald-600" />
        ),
        info: (
          <InfoIcon className="size-5 text-sky-600" />
        ),
        warning: (
          <TriangleAlertIcon className="size-5 text-amber-500" />
        ),
        error: (
          <OctagonXIcon className="size-5 text-rose-600" />
        ),
        loading: (
          <Loader2Icon className="size-5 text-slate-500 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)"
        }
      }
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:p-5 group-[.toaster]:text-sm group-[.toaster]:md:text-[15px] group-[.toaster]:font-semibold group-[.toaster]:w-[400px] group-[.toaster]:rounded-xl group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-3",
        },
      }}
      {...props} />
  );
}

export { Toaster }
