import { ButtonLink } from "../components/ui/Button";
import { EmptyState } from "../components/ui/State";

export default function NotFound() {
  return (
    <div className="container-page py-16">
      <EmptyState title="Sahifa topilmadi" hint="Manzil noto‘g‘ri yoki sahifa ko‘chirilgan.">
        <ButtonLink to="/">Bosh sahifaga</ButtonLink>
      </EmptyState>
    </div>
  );
}
