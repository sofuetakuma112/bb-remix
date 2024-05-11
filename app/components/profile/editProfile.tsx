// import { z } from "zod";
// import {
//   ACCEPTED_IMAGE_TYPES,
//   MAX_FILE_SIZE,
//   MAX_MB,
// } from "@/features/const/validation";
import { Button } from "@/features/ui/button";
import { Input } from "@/features/ui/input";
import { FileUpload } from "@/components/publishPost/fileUpload";
import { useFetcher } from "@remix-run/react";

// const isFileSupported = typeof File !== "undefined";

// const formSchema = z.object({
//   file: isFileSupported
//     ? z
//         .instanceof(File)
//         .refine(
//           (file) => file.size <= MAX_FILE_SIZE,
//           `ファイルサイズが大きすぎます。${MAX_MB}MB以下のファイルを選択してください`
//         )
//         .refine(
//           (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
//           "jpg, png, webpのいずれかの画像を選択してください"
//         )
//         .optional()
//     : z.any().optional(),
//   name: z.string().min(2, { message: "名前は2文字以上である必要があります" }),
// });

type EditProfileProps = {
  userName: string;
  close: () => void;
};

export default function EditProfile({ userName, close }: EditProfileProps) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form
      action="/users/update"
      method="post"
      encType="multipart/form-data"
    >
      <div className="mt-4 flex flex-col items-center px-4 sm:px-8">
        <h1 className="text-lg font-bold sm:text-2xl">
          プロフィールを編集しよう
        </h1>
        <div className="mt-7 w-full">
          <label htmlFor="userName-field" className="text-md font-semibold">
            あなたの名前
          </label>
          <Input
            type="text"
            variant="round"
            borderColor="blue"
            placeholder="name"
            name="userName"
            id="userName-field"
            defaultValue={userName}
          />
        </div>
        <div className="mt-12 w-full">
          <label htmlFor="file-field" className="text-md font-semibold">
            プロフィール画像
          </label>
          <FileUpload name="file" id="file-field" />
        </div>
        <Button
          type="submit"
          variant="upload"
          className="mt-9 font-semibold"
          onClick={close}
        >
          投稿する
        </Button>
      </div>
    </fetcher.Form>
  );
}
