import assert from "node:assert/strict";
import test from "node:test";

import { validateContactForm } from "../lib/contact-form.ts";

test("contact form requires name, email, and message", () => {
  assert.deepEqual(validateContactForm({ name: "", email: "", company: "", message: "" }), {
    name: "required",
    email: "required",
    message: "required",
  });
});

test("contact form rejects invalid email and accepts valid values", () => {
  assert.equal(validateContactForm({ name: "Max", email: "invalid", company: "", message: "Hello there" }).email, "invalid");
  assert.deepEqual(validateContactForm({ name: "Max", email: "max@example.com", company: "Gym", message: "Hello there" }), {});
});
