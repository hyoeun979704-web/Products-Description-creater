// Mirror the CHECK constraints in db/migrations/0001_init.sql.
// Keep this file and the SQL in lockstep.

export const CREDIT_LOG_KINDS = [
  "grant_free",
  "grant_paid",
  "consume",
  "refund",
  "adjust",
] as const;
export type CreditLogKind = (typeof CREDIT_LOG_KINDS)[number];

export const PAYMENT_STATUS = ["pending", "paid", "failed", "canceled"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[number];
