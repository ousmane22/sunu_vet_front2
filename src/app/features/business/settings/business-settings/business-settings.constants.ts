export const SETTINGS_TABS = {
    GENERAL: 'general',
    ROLES: 'roles',
    BILLING: 'billing',
    SUBSCRIPTION: 'subscription',
} as const;

export type SettingsTab = typeof SETTINGS_TABS[keyof typeof SETTINGS_TABS];




