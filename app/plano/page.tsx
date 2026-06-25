import { redirect } from "next/navigation";

// Página /plano descontinuada para pacientes — acesso agora é gratuito.
export default function PlanoPage() {
  redirect("/");
}
