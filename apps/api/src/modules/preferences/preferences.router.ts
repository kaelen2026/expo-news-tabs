import { z } from "zod";
import { protectedProcedure, router } from "../../core/trpc";
import { getPreferenceService } from "./index";
import { PREFERENCE_FONT_SIZES, PREFERENCE_THEMES } from "./preferences.types";

const themeSchema = z.enum(PREFERENCE_THEMES);
const fontSizeSchema = z.enum(PREFERENCE_FONT_SIZES);

const updateInput = z
  .object({
    theme: themeSchema.nullable().optional(),
    defaultCategory: z.string().min(1).nullable().optional(),
    fontSize: fontSizeSchema.nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field is required" });

export const preferencesRouter = router({
  get: protectedProcedure.query(({ ctx }) => getPreferenceService().get(ctx.user.id)),

  update: protectedProcedure
    .input(updateInput)
    .mutation(({ ctx, input }) => getPreferenceService().update(ctx.user.id, input)),
});
