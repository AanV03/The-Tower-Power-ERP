// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const sentryDisabled =
  process.env.NEXT_PUBLIC_SENTRY_DISABLED === "true";
const sentryDsn =
  process.env.NEXT_PUBLIC_SENTRY_DSN ??
  "https://ad1bf9cb7b8d2d67a20cbc290ecd5afa@o4511748453826560.ingest.us.sentry.io/4511748464705536";

Sentry.init({
  dsn: sentryDisabled ? undefined : sentryDsn,
  enabled: !sentryDisabled,

  // Add optional integrations for additional features
  integrations: sentryDisabled ? [] : [Sentry.replayIntegration()],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: sentryDisabled ? 0 : 1,
  // Enable logs to be sent to Sentry
  enableLogs: !sentryDisabled,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: sentryDisabled ? 0 : 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: sentryDisabled ? 0 : 1.0,

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
