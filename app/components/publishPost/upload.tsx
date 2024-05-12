import { FileUpload } from "@/components/publishPost/fileUpload";
import { Button } from "@/features/ui/button";
import { Input } from "@/features/ui/input";
import { Textarea } from "@/features/ui/textarea";
import { Form, useNavigation } from "@remix-run/react";
import { Loader2 } from "lucide-react";
import { SubmissionResult, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { SerializeFrom } from "@remix-run/cloudflare";
import { schema } from "@/features/formSchemas/post";

type Props = {
  lastResult: SerializeFrom<SubmissionResult<string[]>> | undefined;
};

export default function Upload({ lastResult }: Props) {
  const navigation = useNavigation();
  const isSubmitting = navigation.formAction === "/post";

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <Form
      method="post"
      encType="multipart/form-data"
      id={form.id}
      onSubmit={form.onSubmit}
    >
      <div className="mt-8 flex flex-col items-center px-4 sm:mt-8 max-w-[500px] mx-auto">
        <h1 className="text-xl font-bold sm:text-2xl">
          さあ、写真をアップロードしよう
        </h1>
        <div className="mt-6 w-full sm:mt-12 flex flex-col">
          <label htmlFor={fields.file.id}>
            デスクトップから写真をドラッグできます。
          </label>
          <FileUpload id={fields.file.id} name={fields.file.name} />
          <p className="w-full text-red-500 text-left">{fields.file.errors}</p>
        </div>
        <div className="mt-4 w-full sm:mt-7 flex flex-col">
          <label className="text-xl font-semibold" htmlFor="imageName-field">
            画像の女性の名前
          </label>
          <Input
            type="text"
            variant="round"
            placeholder="maria"
            id={fields.imageName.id}
            name={fields.imageName.name}
          />
          <p className="w-full text-red-500">{fields.imageName.errors}</p>
        </div>
        <div className="mt-4 w-full sm:mt-7 flex flex-col">
          <label
            className="text-xl font-semibold"
            htmlFor={fields.imageName.id}
          >
            画像の女性の年齢
          </label>
          <Input
            type="text"
            variant="round"
            placeholder="22"
            id={fields.imageAge.id}
            name={fields.imageAge.name}
          />
          <p className="w-full text-red-500">{fields.imageAge.errors}</p>
        </div>
        <div className="mt-4 w-full sm:mt-7 flex flex-col">
          <label className="text-xl font-semibold" htmlFor={fields.prompt.id}>
            プロンプト
          </label>
          <Textarea
            placeholder="An astronaut playing guitar at Coachella, psychodelic background, photorealistic, f1.4, 4k..."
            id={fields.prompt.id}
            name={fields.prompt.name}
          />
          <p className="w-full text-red-500">{fields.prompt.errors}</p>
        </div>
        <div className="mt-4 w-full sm:mt-7 flex flex-col">
          <label className="text-xl font-semibold" htmlFor={fields.hashtag.id}>
            ハッシュタグ
          </label>
          <Input
            placeholder="#ブロンド #ブルベ #高身長"
            id={fields.hashtag.id}
            name={fields.hashtag.name}
            type="text"
            variant="round"
          />
          <p className="w-full text-red-500">{fields.hashtag.errors}</p>
        </div>
        <Button variant="upload" className="mt-5 font-semibold sm:mt-9">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          投稿する
        </Button>
      </div>
    </Form>
  );
}
