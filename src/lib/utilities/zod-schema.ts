import { z } from "zod";

export const PHONE_NUMBER_REGEX = new RegExp(/(?:\(?\+977\)?)?[9][6-9]\d{8}|01[-]?[0-9]{7}/);

export const phoneNumberSchema = z
  .string({
    required_error: "Please enter the phone number."
  })
  .trim()
  .regex(PHONE_NUMBER_REGEX, "Please enter a valid phone number.");

export const reportSchema = z.object({
  reportType: z
    .string({ required_error: "Please select one of the reporting type." })
    .nonempty("Please select one of the reporting type."),
  description: z
    .string({ required_error: "Please provide the description." })
    .nonempty("Please provide the description."),
  screenshots: z.any()
})

export const loginSchema = z.object({
  saveLogin: z.any().transform((v) => !!v),
  login: z
    .string({ required_error: "Please enter your username or email address." })
    .trim()
    .min(1, "Please enter your username or email address.")
    .transform((v) => v.toLowerCase()),
  password: z
    .string({ required_error: "Please enter your password." })
    .trim()
    .min(1, "Please enter your password.")
    .min(6, "Invalid password.")
});

export const addPackageInfoSchema = z.object({
  remarks: z
    .string()
    .transform((t) => t?.trim())
    .nullable()
    .optional(),
  deliveryCharge: z.coerce.number().default(100),
  cod: z.number().gte(0, "COD can't be less than 0.").default(0),
  customerName: z
    .string({ required_error: "Please enter the full name of the customer." })
    .trim()
    .nonempty("Please enter the full name of the customer.")
    .transform((t) => t.toUpperCase()),
  customerNumber: phoneNumberSchema,
  customerAddress: z
    .string({ required_error: "Please enter the address of the customer." })
    .trim()
    .nonempty("Please enter the address name of the customer."),
  vendorName: z
    .string({ required_error: "Please provide the vendor name." })
    .trim()
    .nonempty("Please provide the vendor name.")
    .transform((v) => v.toUpperCase())
});

export const updatePackageInfoSchema = z.object({});

export const profileSchema = z.object({
  username: z.string().trim().nullable().optional().default(undefined).transform(z => z?.toLowerCase()),
  name: z.string().nonempty("Enter the full name of the user.").trim(),
  email: z
    .string()
    .nonempty("Enter the email address of the user.")
    .trim()
    .email("Please enter a valid email address.")
    .transform(z => z?.toLowerCase())
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: "Please enter your current password." })
      .trim()
      .nonempty("Please enter your current password.")
      .min(6, "Invalid password."),
    newPassword: z
      .string({ required_error: "Please enter a new password." })
      .trim()
      .min(6, "Password must be atleast six characters long."),
    confirmPassword: z
      .string({ required_error: "Please confirm your password." })
      .trim()
      .min(1, "Please confirm your password.")
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"]
  });

export const addVendorSchema = z.object({
  vendorName: z
    .string()
    .nonempty("Enter the name of the vendor.")
    .trim()
    .transform((v) => v.toUpperCase()),
  vendorAddress: z.string().nonempty("Enter the location of the vendor.").trim(),
  mainVendorName: z.string().nonempty("Enter the parent vendor of this vendor.").trim().optional(),
  vendorEmail: z
    .string()
    .nonempty("Enter the email address of the for vendor.")
    .trim()
    .email("Please enter a valid email address.")
    .transform(z => z?.toLowerCase())
});

export const updateVendorSchema = z.object({
  vendorName: z
    .string()
    .nonempty("Enter the name of the vendor.")
    .trim()
    .transform((v) => v.toUpperCase()),
  vendorAddress: z.string().nonempty("Enter the location of vendor.").trim().optional(),
  vendorEmail: z
    .string()
    .nonempty("Enter the email address of the vendor.")
    .trim()
    .email()
    .optional()
    .transform(z => z?.toLowerCase()),
  mainVendorName: z
    .string()
    .nonempty("Enter the parent vendor of this vendor.")
    .trim()
    .optional()
    .nullable()
    .default(undefined)
    .transform((v) => (v ? v.toUpperCase() : v))
});

export const updateUserSchema = z
  .object({
    role: z.string().trim().default("NORMALUSER"),
    name: z.string().nonempty("Enter the full name of the user.").trim(),
    vendorName: z
      .string()
      .nonempty("Enter the vendor of the user.")
      .trim()
      .transform((v) => v.toUpperCase()),
    username: z.string().trim().nullable().optional().default(undefined).transform(z => z?.toLowerCase()),
    email: z
      .string()
      .nonempty("Enter the email address of the user.")
      .trim()
      .email("Please enter a valid email address.")
      .transform(z => z?.toLowerCase()),
    password: z.string().trim().optional().nullable(),
    confirmPassword: z.string().trim().optional().nullable(),
    autoGeneratePassword: z.boolean().default(false)
  })
  .superRefine((data, ctx) => {
    if (data.autoGeneratePassword) return;
    if (!data.password) {
      ctx.addIssue({
        path: ["password"],
        code: z.ZodIssueCode.custom,
        message: "Please enter the new password."
      });
    } else if (data.password.length < 6) {
      ctx.addIssue({
        path: ["password"],
        code: z.ZodIssueCode.custom,
        message: "Password must be atleast six characters long."
      });
    }
    if (!data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: z.ZodIssueCode.custom,
        message: "Please confirm the new password."
      });
    } else if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: z.ZodIssueCode.custom,
        message: "The two passwords don't match."
      });
    }
  });

export const addUserSchema = z
  .object({
    role: z.string().trim().default("NORMALUSER"),
    username: z.string().trim().nullable().optional().default(undefined).transform(z => z?.toLowerCase()),
    name: z.string().nonempty("Enter the full name of the user.").trim(),
    vendorName: z
      .string()
      .nonempty("Enter the vendor of the user.")
      .trim()
      .transform((v) => v.toUpperCase()),
    email: z
      .string()
      .nonempty("Enter the email address of the user.")
      .trim()
      .email("Please enter a valid email address.")
      .transform(z => z?.toLowerCase()),
    password: z.string().trim().optional().nullable(),
    confirmPassword: z.string().trim().optional().nullable(),
    autoGeneratePassword: z.boolean().default(false),
    sendInvitationLink: z.boolean().optional()
  })
  .superRefine((data, ctx) => {
    if (data.autoGeneratePassword || data.sendInvitationLink) return;

    if (data.password && data.password.trim() === "") {
      ctx.addIssue({
        path: ["password"],
        code: z.ZodIssueCode.custom,
        message: "Please enter a new password."
      });
    } else if (data.password?.length < 6) {
      ctx.addIssue({
        path: ["password"],
        code: z.ZodIssueCode.custom,
        message: "Password must be atleast six characters long."
      });
    }
    if (!!data.password && !data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: z.ZodIssueCode.custom,
        message: "Please confirm the new password."
      });
    } else if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: z.ZodIssueCode.custom,
        message: "The two passwords don't match."
      });
    }
  });

export const resetPasswordSchema = z
  .object({
    email: z
      .string({ required_error: "Please enter your email address." })
      .nonempty("Please enter your email address.")
      .trim()
      .email().transform(z => z?.toLowerCase()),
    token: z.string().optional(),
    otp: z
      .preprocess(
        (v) => String(v),
        z
          .string()
          .length(6, "Invalid otp code.")
          .transform((v) => String(v))
          .optional()
      )
      .optional(),
    newPassword: z.string().trim().optional().nullable(),
    confirmPassword: z.string().trim().optional().nullable()
  })
  .superRefine((data, ctx) => {
    if (data.password) {
      if (data.password.length < 6) {
        ctx.addIssue({
          path: ["password"],
          code: z.ZodIssueCode.custom,
          message: "Password must be atleast six characters long."
        });
      }
      if (!data.confirmPassword) {
        ctx.addIssue({
          path: ["confirmPassword"],
          code: z.ZodIssueCode.custom,
          message: "Please confirm the new password."
        });
      } else if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          path: ["confirmPassword"],
          code: z.ZodIssueCode.custom,
          message: "The two passwords don't match."
        });
      }
    }
  });
