import { Button } from "@/features/ui/button";
import { Form } from "@remix-run/react";
import clsx from "clsx";

type Props = {
  className?: string;
};

export default function SignInWithGoogle({ className }: Props) {
  return (
    <div className="flex flex-col items-center">
      <Form action="/auth/google" method="post">
        <Button
          className={clsx(
            "my-3 w-72 rounded-lg px-4 py-2 font-bold",
            String(className)
          )}
          type="submit"
        >
          Googleでログイン
        </Button>
      </Form>
    </div>
  );
}
