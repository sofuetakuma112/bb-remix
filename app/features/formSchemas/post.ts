import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  MAX_MB,
} from "@/features/const/validation";
import { z } from "zod";

const hashTagWords = z
  .string()
  .regex(
    /^#([\p{L}\p{N}_]+)(\s+#[\p{L}\p{N}_]+)*$/u,
    "各単語は'#'で始まり、単語はスペースで区切られます。ハッシュタグには文字と数字が使用できます"
  )
  .optional();

export const schema = z.object({
  file: z
    .instanceof(File, { message: "画像ファイルは必須です" })
    .refine((file) => {
      console.log(file);
      return file.size <= MAX_FILE_SIZE;
    }, `ファイルサイズが大きすぎます。${MAX_MB}MB以下のファイルを選択してください`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "jpg, png, webpのいずれかの画像を選択してください"
    ),
  prompt: z
    .string({ required_error: "プロンプトは必須です" })
    .min(2, { message: "プロンプトは少なくとも2文字以上にしてください" }),
  imageName: z
    .string({ required_error: "画像の女性の名前は必須です" })
    .min(2, { message: "画像の女性の名前は少なくとも2文字以上にしてください" }),
  imageAge: z
    .string({ required_error: "画像の女性の年齢は必須です" })
    .min(1, { message: "画像の女性の年齢は少なくとも2文字以上にしてください" }),
  hashtag: hashTagWords,
});
