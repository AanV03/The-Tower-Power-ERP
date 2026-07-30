// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const sentryDisabled = process.env.E2E_DISABLE_SENTRY === "true";
const sentryDsn =
  process.env.SENTRY_DSN ??
  "https://ad1bf9cb7b8d2d67a20cbc290ecd5afa@o4511748453826560.ingest.us.sentry.io/4511748464705536";

Sentry.init({
  dsn: sentryDisabled ? undefined : sentryDsn,
  enabled: !sentryDisabled,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: sentryDisabled ? 0 : 1,

  // Enable logs to be sent to Sentry
  enableLogs: !sentryDisabled,

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});
