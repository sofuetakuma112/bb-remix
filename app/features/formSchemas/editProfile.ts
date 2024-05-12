import { z } from "zod";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  MAX_MB,
} from "@/features/const/validation";

export const schema = z.object({
  file: z
    .instanceof(File, { message: "画像ファイルは必須です" })
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `ファイルサイズが大きすぎます。${MAX_MB}MB以下のファイルを選択してください`
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "jpg, png, webpのいずれかの画像を選択してください"
    )
    .optional(),
  name: z.string().min(2, { message: "名前は2文字以上である必要があります" }),
});
