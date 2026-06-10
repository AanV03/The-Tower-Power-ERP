export const en = {
  landing: {
    eyebrow: "Multi-branch ERP for gyms",
    description:
      "Frontend foundation prepared for a future landing page and SaaS operations with configurable branding, locale routing, and responsive administration screens.",
    primaryAction: "Open dashboard",
  },
  common: {
    productCategory: "Gym ERP",
    dashboard: "Dashboard",
    branch: "Branch",
    region: "Region",
    consolidated: "Consolidated",
    active: "Active",
    warning: "Warning",
    critical: "Critical",
    viewDetails: "View details",
    quickActions: "Quick actions",
    searchPlaceholder: "Search member, invoice or module",
    tenant: "Tenant",
    language: "Language",
    account: "My account",
    logout: "Sign out",
    profile: "Profile",
    settings: "Settings",
    toggleSidebar: "Toggle sidebar",
    notifications: "Notifications",
    notificationsHistory: "Notification history",
    noNotifications: "No new notifications",
    systemUpdated: "System updated successfully",
    theme: "Theme",
    lightTheme: "Light",
    darkTheme: "Dark",
    primaryNavigation: "Primary navigation",
    moduleNavigation: "ERP modules",
    moduleMenu: "Module menu",
    closeMenu: "Close menu",
    metricsAriaLabel: "Key metrics",
    refresh: "Refresh",
    scope: "Scope",
    languageNames: {
      es: "Español",
      en: "English",
      fr: "Français",
    },
  },
  modules: {
    dashboard: "Operations board",
    memberships: "Subscriptions",
    access: "Access",
    finance: "Finance",
    pos: "Point of sale",
    inventory: "Inventory",
    hr: "HR and payroll",
    marketing: "Marketing",
    specialists: "Specialists",
    admin: "SaaS Admin",
  },
  auth: {
    passwordRules: {
      length: "Minimum 8 characters",
      upper: "At least one uppercase letter",
      number: "At least one number",
      special: "At least one special character",
    },
    passwordStrength: "Password strength",
    strength: {
      weak: "Weak",
      fair: "Fair",
      good: "Good",
      strong: "Strong",
    },
    fields: {
      name: "Full name",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm password",
    },
    placeholders: {
      name: "John Garcia",
      email: "you@company.com",
      password: "••••••••",
    },
    errors: {
      nameMin: "Name must be at least 2 characters",
      emailRequired: "Email is required",
      emailInvalid: "Enter a valid email",
      passwordRequired: "Password is required",
      passwordRequirements: "Password does not meet the requirements",
      confirmRequired: "Confirm your password",
      confirmMismatch: "Passwords do not match",
    },
    actions: {
      showPassword: "Show password",
      hidePassword: "Hide password",
      showConfirmation: "Show confirmation",
      hideConfirmation: "Hide confirmation",
    },
    legal: {
      terms: "Terms of use",
      privacy: "Privacy policy",
      continuePrefix: "By continuing you accept the",
      signupPrefix: "By signing up you accept the",
      and: "and the",
    },
    signin: {
      title: "Welcome back",
      subtitle: "Sign in to your Gerpy ERP account",
      forgotPassword: "Forgot your password?",
      submit: "Sign in",
      loading: "Signing in…",
      footerPrefix: "Do not have an account?",
      footerAction: "Create account",
    },
    signup: {
      title: "Create your account",
      subtitle: "Join Gerpy ERP and start managing your gym",
      submit: "Create account",
      loading: "Creating account…",
      footerPrefix: "Already have an account?",
      footerAction: "Sign in",
      passwordMatch: "Passwords match",
    },
  },
  quickActions: {
    groupLabel: "Quick actions",
    successMessage: "Action registered in the frontend prototype.",
    errorMessage: "An error occurred while running the action.",
  },
  moduleTable: {
    title: "Recent activity",
    description: "Operational events ready to connect to future APIs.",
    item: "Item",
    branch: "Branch",
    status: "Status",
    amount: "Value",
    owner: "Owner",
    noData: "No recent activity",
    noDataDesc: "There are no events to show.",
  },
  moduleChart: {
    title: "Operational trend",
    description: "Sample data to design future API integration.",
    noData: "No data available",
    noDataDesc: "There is no information to show in the chart.",
  },
  audit: {
    title: "Secure audit trail",
    description: "Trace of critical actions for RBAC and compliance.",
    noData: "No audit events",
    noDataDesc: "No activities have been recorded.",
    listLabel: "Audit events",
  },
  emptyState: {
    noResults: "No results",
    noResultsDescription: "We could not find results for \"{query}\". Try other terms.",
    clearSearch: "Clear search",
    noData: "No data",
    noDataDescription: "No information is available right now.",
    error: "An error occurred",
    errorDescription: "We could not load the data. Please try again.",
  },
  errors: {
    title: "Something went wrong",
    description: "Sorry, an unexpected error occurred. Please try again.",
    retry: "Try again",
    home: "Go home",
  },
  status: {
    activeDescription: "Active status",
    warningDescription: "Requires attention",
    criticalDescription: "Critical status",
  },
  metricCard: {
    changeLabel: "Change: {change}",
  },
  branding: {
    title: "Brand Colors",
    save: "Save changes",
    reset: "Restore defaults",
    saved: "Saved!",
    preview: "Live preview active",
    previewDesc: "Click the swatch to pick a color. Changes apply in real time.",
    colorPicker: "Color picker for {label}",
    colorHex: "{label} hex value",
    changeColorTitle: "Click to change color",
    fields: {
      sidebarBg: {
        label: "Sidebar",
        description: "Background of the side navigation panel.",
      },
      topbarBg: {
        label: "Topbar",
        description: "Background of the top toolbar.",
      },
      primaryColor: {
        label: "Primary Color",
        description: "Buttons, active states and primary charts.",
      },
      accentColor: {
        label: "Secondary Color",
        description: "Sidebar logo, alerts and secondary highlights.",
      },
    },
  },
  marketing: {
    funnel: {
      title: "Conversion Funnel",
      description: "Conversion rate per pipeline stage",
      stages: {
        leads: "Leads",
        tours: "Tours",
        trials: "Trials",
        paid: "Paid"
      },
      conversionRate: "Conversion Rate",
      dropoff: "Dropoff"
    },
    campaigns: {
      title: "Active Campaigns",
      description: "Performance monitoring by channel",
      newCampaign: "New campaign",
      status: {
        active: "Active",
        draft: "Draft",
        scheduled: "Scheduled",
        paused: "Paused"
      },
      metrics: {
        sent: "Sent",
        openRate: "Open Rate",
        clickRate: "Clicks",
        conversion: "Conv."
      },
      actions: {
        pause: "Pause",
        resume: "Resume",
        viewDetails: "Details"
      }
    },
    segments: {
      title: "Audience Segments",
      description: "Targeted customer groups",
      members: "members",
      actions: {
        send: "Send campaign"
      },
      names: {
        churn: "At Churn Risk",
        spenders: "High Spenders",
        inactive: "Inactive 14d",
        newSignups: "New Signups"
      }
    },
    automations: {
      title: "Automation Flows",
      description: "Active sequences triggered by events",
      steps: {
        trigger: "Trigger: Signup",
        delay: "Wait 1 day",
        email: "Send Welcome Email",
        condition: "App Used?",
        yes: "Yes: Pro Email",
        no: "No: Reminder"
      },
      stats: {
        activeUsers: "active users"
      }
    },
    modal: {
      title: "Create New Campaign",
      subtitle: "Configure delivery channel, target segment, and message content.",
      fields: {
        name: "Campaign Name",
        namePlaceholder: "e.g., Summer Discount 2026",
        channel: "Delivery Channel",
        segment: "Target Segment",
        content: "Message Content",
        contentPlaceholder: "Write the text or template to send..."
      },
      actions: {
        cancel: "Cancel",
        submit: "Launch Campaign"
      },
      success: "Campaign successfully created!"
    }
  }
} as const;

