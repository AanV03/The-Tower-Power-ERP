"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

interface OtpCodeInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

const CODE_LENGTH = 6;

export function OtpCodeInput({ id, label, value, onChange, hasError }: OtpCodeInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: CODE_LENGTH }, (_, index) => value[index] ?? "");

  function updateDigit(index: number, digit: string) {
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    onChange(nextDigits.join("").slice(0, CODE_LENGTH));

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleInput(index: number, rawValue: string) {
    const sanitizedValue = rawValue.replace(/\D/g, "");

    if (sanitizedValue.length > 1) {
      const nextDigits = [...digits];
      sanitizedValue.slice(0, CODE_LENGTH - index).split("").forEach((digit, offset) => {
        nextDigits[index + offset] = digit;
      });
      onChange(nextDigits.join("").slice(0, CODE_LENGTH));
      inputRefs.current[Math.min(index + sanitizedValue.length, CODE_LENGTH - 1)]?.focus();
      return;
    }

    updateDigit(index, sanitizedValue);
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>, startIndex: number) {
    event.preventDefault();
    const pastedDigits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH - startIndex);

    if (!pastedDigits) return;

    const nextDigits = [...digits];
    pastedDigits.split("").forEach((digit, offset) => {
      nextDigits[startIndex + offset] = digit;
    });

    onChange(nextDigits.join("").slice(0, CODE_LENGTH));
    inputRefs.current[Math.min(startIndex + pastedDigits.length, CODE_LENGTH - 1)]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      inputRefs.current[Math.max(index - 1, 0)]?.focus();
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      inputRefs.current[Math.min(index + 1, CODE_LENGTH - 1)]?.focus();
      return;
    }

    if (event.key !== "Backspace") return;

    if (digits[index]) {
      return;
    }

    event.preventDefault();
    const previousIndex = Math.max(index - 1, 0);
    const nextDigits = [...digits];
    nextDigits[previousIndex] = "";
    onChange(nextDigits.join("").slice(0, CODE_LENGTH));
    inputRefs.current[previousIndex]?.focus();
  }

  return (
    <div className="space-y-1.5">
      <label id={`${id}-label`} className="auth-label block text-sm font-medium">
        {label}
      </label>
      <div className="grid grid-cols-6 gap-2" role="group" aria-labelledby={`${id}-label`}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            id={index === 0 ? id : undefined}
            type="text"
            inputMode="numeric"
            pattern="[0-9]"
            maxLength={1}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            value={digit}
            onChange={(event) => handleInput(index, event.target.value)}
            onPaste={(event) => handlePaste(event, index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            aria-label={`${label} digit ${index + 1}`}
            aria-invalid={hasError ? "true" : "false"}
            className={cn(
              "auth-code-cell h-12 w-full rounded-lg border text-center font-mono text-lg font-semibold outline-none transition-[box-shadow,border-color,background-color]",
              hasError ? "auth-input-error" : "",
            )}
          />
        ))}
      </div>
    </div>
  );
}
