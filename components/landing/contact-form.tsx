"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

import type { Dictionary } from "@/lib/i18n";
import { validateContactForm, type ContactFormErrors, type ContactFormValues } from "@/lib/contact-form";

const empty: ContactFormValues = { name: "", email: "", company: "", message: "" };

export function ContactForm({ copy }: { copy: Dictionary["landing"]["contactPage"]["form"] }) {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = validateContactForm(values);
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setSent(true);
  };

  if (sent) {
    return <div role="status" className="border border-[color:var(--landing-border)] bg-[var(--landing-panel)] p-8"><h2 className="text-3xl font-black uppercase">{copy.successTitle}</h2><p className="mt-3 text-[var(--landing-copy)]">{copy.successDescription}</p><button className="mt-6 bg-[var(--landing-primary)] px-5 py-3 text-xs font-black uppercase text-white" onClick={() => { setValues(empty); setErrors({}); setSent(false); }}>{copy.reset}</button></div>;
  }

  const field = (name: keyof ContactFormValues, label: string, placeholder: string, area = false) => {
    const error = errors[name as keyof ContactFormErrors];
    const errorId = `contact-${name}-error`;
    const common = {
      name,
      value: values[name],
      placeholder,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues({ ...values, [name]: event.target.value }),
      className: "border border-[color:var(--landing-border)] bg-[var(--landing-panel-muted)] p-3",
      "aria-invalid": !!error,
      "aria-describedby": error ? errorId : undefined,
    };
    return <label className="grid gap-2"><span className="text-sm font-black">{label}</span>{area ? <textarea {...common} rows={6} /> : <input {...common} type={name === "email" ? "email" : "text"} />}{error ? <span id={errorId} className="text-sm text-red-400">{error === "invalid" ? copy.emailError : copy.requiredError}</span> : null}</label>;
  };

  return <form ref={formRef} onSubmit={submit} noValidate className="grid gap-5 border border-[color:var(--landing-border)] bg-[var(--landing-panel)] p-6 sm:p-8"><h2 className="text-3xl font-black uppercase">{copy.title}</h2><div className="grid gap-5 sm:grid-cols-2">{field("name", copy.nameLabel, copy.namePlaceholder)}{field("email", copy.emailLabel, copy.emailPlaceholder)}{field("company", copy.companyLabel, copy.companyPlaceholder)}</div>{field("message", copy.messageLabel, copy.messagePlaceholder, true)}<button className="justify-self-start bg-[var(--landing-primary)] px-6 py-3 text-xs font-black uppercase text-white">{copy.submit}</button></form>;
}
