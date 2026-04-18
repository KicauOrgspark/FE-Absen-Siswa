// Re-export types dan variants yang dipakai bersama antar komponen

export type {
  LoginFormData,
  TokenFormData,
  Screen,
  ErrorType,
  AppError,
} from "../app/hooks/useLoginPage";

export {
  MAX_TOKEN_ATTEMPTS,
  parseLoginError,
  parseTokenError,
} from "../app/hooks/useLoginPage";

/* ── animation variants ── */
export const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0, y: -24, scale: 0.97,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fieldVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.08 + 0.2, duration: 0.4, ease: "easeOut" },
  }),
};

export const errorBannerVariants = {
  hidden: { opacity: 0, height: 0, marginBottom: 0 },
  visible: { opacity: 1, height: "auto", marginBottom: 16, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.25 } },
};