import { z } from "zod"

// ── Auth ──────────────────────────────────────────────────────────
export const loginSchema = z.object({
  phone: z.string().min(10).max(15).optional(),
  email: z.string().email().optional(),
}).refine(data => data.phone || data.email, {
  message: "Phone or email required",
})

export const verifyOtpSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  token: z.string().length(6),
})

export const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().min(10).max(15).optional(),
  preferredLanguage: z.enum(["tr", "en", "ru"]).default("tr"),
})

// ── Children ──────────────────────────────────────────────────────
export const childSchema = z.object({
  fullName: z.string().min(2).max(100),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(["male", "female", "other"]).optional(),
  medicalNotes: z.string().max(500).optional(),
  emergencyContact: z.string().max(100).optional(),
})

// ── Subscription ──────────────────────────────────────────────────
export const createSubscriptionSchema = z.object({
  userId: z.string().uuid(),
  packageId: z.number().int().positive(),
  childId: z.string().uuid().optional(),
  subscriptionType: z.enum(["regular", "individual", "trial", "group"]).default("regular"),
  lessonsTotal: z.number().int().positive().max(100),
  expiresAt: z.string().datetime(),
  notes: z.string().max(500).optional(),
})

// ── Registration (KVKK) ───────────────────────────────────────────
const optionalText = (max: number) =>
  z.string().max(max).optional().or(z.literal(""))

export const registrationSchema = z.object({
  // Parent / guardian (Veli)
  parentName: z.string().min(2).max(120),
  parentIdNo: optionalText(40),
  parentRelationship: z.enum(["mother", "father", "guardian"]).optional().or(z.literal("")),
  parentEmail: z.string().email().max(160).optional().or(z.literal("")),
  parentPhone: z.string().min(7).max(25), // WhatsApp
  parentAddress: optionalText(300),
  // Child (Çocuk)
  childName: z.string().min(2).max(120),
  childBirthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  childGender: z.enum(["male", "female", "other"]).optional().or(z.literal("")),
  childHealthNotes: optionalText(500),
  emergencyContact: optionalText(120),
  // Enrollment interest
  branch: z.enum(["painting", "chess", "crafts", "individual"]),
  packageId: optionalText(20),
  preferredLanguage: z.enum(["tr", "en", "ru"]).default("tr"),
  message: optionalText(1000),
  // Consents — the two required ones must be literally `true`
  consentKvkk: z.literal(true),
  consentLiability: z.literal(true),
  consentMedia: z.boolean().optional().default(false),
})

// ── Booking ───────────────────────────────────────────────────────
export const bookClassSchema = z.object({
  sessionId: z.string().uuid(),
  childId: z.string().uuid().optional(),
})

export const cancelBookingSchema = z.object({
  enrollmentId: z.string().uuid(),
  reason: z.string().max(200).optional(),
})

// ── Schedule ──────────────────────────────────────────────────────
export const classTypeSchema = z.object({
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  nameTr: z.string().min(2).max(100),
  nameEn: z.string().min(2).max(100),
  nameRu: z.string().min(2).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  icon: z.string().max(50).optional(),
  durationMin: z.number().int().min(15).max(480),
  maxCapacity: z.number().int().min(1).max(50),
  ageMin: z.number().int().min(0).optional(),
  ageMax: z.number().int().min(0).optional(),
})

export const templateSchema = z.object({
  classTypeId: z.number().int().positive(),
  trainerId: z.string().uuid().optional(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  maxCapacity: z.number().int().min(1).max(50).optional(),
  room: z.string().max(50).optional(),
})

// ── Payments ──────────────────────────────────────────────────────
export const paymentSchema = z.object({
  subscriptionId: z.string().uuid(),
  userId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.enum(["EUR", "TRY", "USD"]).default("EUR"),
  method: z.enum(["cash", "card", "transfer"]).default("cash"),
  notes: z.string().max(200).optional(),
})

// ── Settings ──────────────────────────────────────────────────────
export const settingSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
})

// ── Chat ───────────────────────────────────────────────────────────
export const chatMessageSchema = z.object({
  roomId: z.string().uuid(),
  content: z.string().min(1).max(4000),
})

export const chatRoomCreateSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().max(100).optional(),
})

export const chatReadSchema = z.object({
  roomId: z.string().uuid(),
  messageIds: z.array(z.string().uuid()).optional(),
})

// ── Notifications ──────────────────────────────────────────────────
export const notificationBroadcastSchema = z.object({
  userId: z.string().uuid().optional(),
  type: z.enum([
    "general", "class_reminder", "class_cancelled", "booking_confirmed",
    "payment_recorded", "sub_expiring", "sub_expired", "sub_low", "broadcast"
  ]),
  title: z.string().min(1).max(200),
  body: z.string().max(2000).optional(),
  link: z.string().max(500).optional(),
  actionText: z.string().max(100).optional(),
})
