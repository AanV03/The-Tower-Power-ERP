export type ContactFormValues = { name: string; email: string; company: string; message: string };
export type ContactFormErrors = Partial<Record<"name" | "email" | "message", "required" | "invalid">>;
export function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};
  if (!values.name.trim()) errors.name = "required";
  if (!values.email.trim()) errors.email = "required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "invalid";
  if (!values.message.trim()) errors.message = "required";
  return errors;
}
