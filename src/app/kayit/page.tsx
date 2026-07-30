import type { Metadata } from "next";
import { RegistrationForm } from "@/components/RegistrationForm";

export const metadata: Metadata = {
  title: "Kayıt Formu · Registration · Регистрация | Make Art Studio Alanya",
  description:
    "Çocuğunuzu resim, el sanatları veya satranç dersine kaydedin · Register your child for painting, crafts or chess.",
};

export default function KayitPage() {
  return <RegistrationForm />;
}
