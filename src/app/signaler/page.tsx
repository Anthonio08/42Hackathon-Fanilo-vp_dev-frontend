import { redirect } from "next/navigation";

export default function SignalerPage() {
  redirect("/carte?report=true");
}

