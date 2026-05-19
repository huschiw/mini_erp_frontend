import { z } from "zod";

const nonNegativeInt = (field: string) =>
  z
    .number({ error: `${field} must be a number` })
    .refine((n) => Number.isFinite(n), { message: `${field} must be a number` })
    .int({ message: `${field} must be a whole number` })
    .min(0, { message: `${field} cannot be negative` });

const nonNegativeDecimal = (field: string) =>
  z
    .number({ error: `${field} must be a number` })
    .refine((n) => Number.isFinite(n), { message: `${field} must be a number` })
    .min(0, { message: `${field} cannot be negative` })
    .refine((n) => Math.abs(Math.round(n * 4) - n * 4) < 1e-8, {
      message: `${field} must use .00, .25, .50, or .75 satang`,
    });

export const productFormSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  stock: nonNegativeInt("Stock"),
  minimumStock: nonNegativeInt("Minimum stock"),
  costPrice: nonNegativeDecimal("Cost price"),
  sellingPrice: nonNegativeDecimal("Selling price"),
  imageUrl: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;
