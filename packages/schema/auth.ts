export const SCHOOL_EMAIL_DOMAIN = 'lukasiewicz-gorlice.pl';

export const AuthErrorReason = {
    INVALID_DOMAIN: 'INVALID_DOMAIN',
    AUTH_FAILED: 'AUTH_FAILED',
} as const;

export type AuthErrorReason = keyof typeof AuthErrorReason;

export const AUTH_ERRORS = {
    [AuthErrorReason.INVALID_DOMAIN]: {
        title: "Nieprawidłowy adres email",
        desc: `Zaloguj się szkolnym mailem!`
    },
    [AuthErrorReason.AUTH_FAILED]: {
        title: "Błąd autoryzacji",
        desc: "Nie udało się pobrać danych z Google. Spróbuj ponownie!"
    },
    default: {
        title: "Coś poszło nie tak",
        desc: "Wystąpił nieoczekiwany błąd. Jeśli problem się powtarza, skontaktuj się z administracją."
    }
} as const;
