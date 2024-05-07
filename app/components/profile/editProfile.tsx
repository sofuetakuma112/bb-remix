import { z } from "zod";
// import { updateUser } from "@/features/actions/user";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  MAX_MB,
} from "@/features/const/validation";
import { Button } from "@/features/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/features/ui/form";
import { Input } from "@/features/ui/input";
import { FileUpload } from "@/components/publishPost/fileUpload";
import { Form } from "@remix-run/react";

const isFileSupported = typeof File !== "undefined";

const formSchema = z.object({
  file: isFileSupported
    ? z
        .instanceof(File)
        .refine(
          (file) => file.size <= MAX_FILE_SIZE,
          `ファイルサイズが大きすぎます。${MAX_MB}MB以下のファイルを選択してください`
        )
        .refine(
          (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
          "jpg, png, webpのいずれかの画像を選択してください"
        )
        .optional()
    : z.any().optional(),
  name: z.string().min(2, { message: "名前は2文字以上である必要があります" }),
});

type EditProfileProps = {
  userId: string;
  userName: string;
  close: () => void;
};

export default function EditProfile({
  // userId,
  userName,
}: // close,
EditProfileProps) {
  // const form = useForm<z.infer<typeof formSchema>>({
  //   resolver: zodResolver(formSchema),
  //   defaultValues: {
  //     file: undefined,
  //     name: userName,
  //   },
  // });

  const onSubmit = form.handleSubmit((data: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("userName", data.name);
    // updateUser(formData, userId).then(() => close());
  });

  return (
    <Form action="/users/update" method="post">
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
          <div>
            <FileUpload name="file" id="file-field" />
          </div>
        </div>
        <Button type="submit" variant="upload" className="mt-9 font-semibold">
          投稿する
        </Button>
      </div>
    </Form>
  );
}
