"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type DialogVariant = "alert" | "confirm" | "success";

interface DialogState {
  variant: DialogVariant;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  resolve?: (value: boolean) => void;
}

interface AppDialogContextValue {
  alert: (message: string, title?: string) => Promise<void>;
  confirm: (message: string, title?: string) => Promise<boolean>;
  success: (message: string, title?: string) => Promise<void>;
}

const AppDialogContext = createContext<AppDialogContextValue | null>(null);

export function AppDialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const closeDialog = useCallback((result: boolean) => {
    const current = dialog;
    setDialog(null);
    current?.resolve?.(result);
  }, [dialog]);

  const alert = useCallback((message: string, title = "알림") => {
    return new Promise<void>((resolve) => {
      setDialog({
        variant: "alert",
        title,
        message,
        confirmLabel: "확인",
        cancelLabel: "",
        resolve: () => resolve(),
      });
    });
  }, []);

  const confirm = useCallback((message: string, title = "확인") => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        variant: "confirm",
        title,
        message,
        confirmLabel: "확인",
        cancelLabel: "취소",
        resolve,
      });
    });
  }, []);

  const success = useCallback((message: string, title = "완료") => {
    return new Promise<void>((resolve) => {
      setDialog({
        variant: "success",
        title,
        message,
        confirmLabel: "확인",
        cancelLabel: "",
        resolve: () => resolve(),
      });
    });
  }, []);

  const value = useMemo(
    () => ({ alert, confirm, success }),
    [alert, confirm, success],
  );

  return (
    <AppDialogContext.Provider value={value}>
      {children}

      {dialog && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && dialog.variant === "confirm") {
              closeDialog(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-dialog-title"
            className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  dialog.variant === "success"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : dialog.variant === "confirm"
                      ? "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                }`}
              >
                {dialog.variant === "success" ? "✓" : dialog.variant === "confirm" ? "?" : "i"}
              </div>

              <div className="min-w-0 flex-1">
                <h2 id="app-dialog-title" className="text-base font-bold text-neutral-900 dark:text-white">
                  {dialog.title}
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                  {dialog.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => closeDialog(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl leading-none text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            <div className="mt-5 flex gap-2">
              {dialog.variant === "confirm" && (
                <button
                  type="button"
                  onClick={() => closeDialog(false)}
                  className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
                >
                  {dialog.cancelLabel}
                </button>
              )}

              <button
                type="button"
                onClick={() => closeDialog(true)}
                className="flex-1 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:opacity-90 dark:bg-white dark:text-neutral-900"
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppDialogContext.Provider>
  );
}

export function useAppDialog() {
  const context = useContext(AppDialogContext);

  if (!context) {
    throw new Error("useAppDialog must be used within AppDialogProvider");
  }

  return context;
}
