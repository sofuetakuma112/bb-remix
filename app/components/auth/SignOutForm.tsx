import { Button } from "@/features/ui/button";
import { Form } from "@remix-run/react";

export default function SignOutForm() {
  return (
    <Form action="/logout" method="POST">
      <Button variant="delete" className="m-2" type="submit">
        ログアウト
      </Button>
    </Form>
  );
}
