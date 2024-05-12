import { Button } from "@/features/ui/button";
import { Input } from "@/features/ui/input";
import { FileUpload } from "@/components/publishPost/fileUpload";
import { useActionData, useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { action } from "@/routes/users.update";
import { useForm } from "@conform-to/react";
import { schema } from "@/features/formSchemas/editProfile";
import { parseWithZod } from "@conform-to/zod";

type EditProfileProps = {
  userName: string;
  close: () => void;
};

export default function EditProfile({ userName, close }: EditProfileProps) {
  const fetcher = useFetcher();

  const result = useActionData<typeof action>();
  const lastResult = result != null && "message" in result ? undefined : result;

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    shouldRevalidate: "onBlur",
  });

  useEffect(() => {
    if (fetcher.state === "loading") {
      // ローダーが呼ばれた際のステート
      close();
    }
  }, [close, fetcher.state]);

  const isSubmitting = fetcher.state === "submitting";

  return (
    <fetcher.Form
      action="/users/update"
      method="post"
      encType="multipart/form-data"
      id={form.id}
      onSubmit={form.onSubmit}
    >
      <div className="mt-4 flex flex-col items-center px-4 sm:px-8">
        <h1 className="text-lg font-bold sm:text-2xl">
          プロフィールを編集しよう
        </h1>
        <div className="mt-7 w-full">
          <label htmlFor={fields.name.id} className="text-md font-semibold">
            あなたの名前
          </label>
          <Input
            type="text"
            variant="round"
            borderColor="blue"
            placeholder="name"
            id={fields.name.id}
            name={fields.name.name}
            defaultValue={userName}
          />
          <p className="w-full text-red-500">{fields.name.errors}</p>
        </div>
        <div className="mt-12 w-full">
          <label htmlFor={fields.file.id} className="text-md font-semibold">
            プロフィール画像
          </label>
          <FileUpload id={fields.file.id} name={fields.file.name} />
          <p className="w-full text-red-500">{fields.file.errors}</p>
        </div>
        <Button variant="upload" className="mt-9 font-semibold">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          投稿する
        </Button>
      </div>
    </fetcher.Form>
  );
}
