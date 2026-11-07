import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import QRCode from "qrcode";
import { Printer } from "lucide-react";
import { Button } from "../components/ui/Button";
import { EmptyState, ErrorState, Spinner } from "../components/ui/State";
import { supabase } from "../lib/supabase";
import { unwrap, useAsync } from "../lib/useAsync";
import { formatDate, type CertificateInfo } from "../lib/types";

export default function CertificateView() {
  const { code = "" } = useParams();
  const [qr, setQr] = useState<string | null>(null);
  const verifyUrl = `${window.location.origin}/tekshirish/${code}`;

  const { data, loading, error, reload } = useAsync(async () => {
    const rows = unwrap(await supabase.rpc("verify_certificate", { p_code: code })) as CertificateInfo[];
    return rows[0] ?? null;
  }, [code]);

  useEffect(() => {
    QRCode.toDataURL(verifyUrl, { margin: 1, width: 160 }).then(setQr).catch(() => setQr(null));
  }, [verifyUrl]);

  if (loading) return <div className="container-page"><Spinner /></div>;
  if (error) return <div className="container-page py-10"><ErrorState message={error} onRetry={reload} /></div>;
  if (!data) return <div className="container-page py-12"><EmptyState title="Sertifikat topilmadi" hint="Kod noto‘g‘ri yoki sertifikat mavjud emas." /></div>;

  return (
    <div className="container-page max-w-4xl space-y-4 py-8 print:max-w-none print:p-0">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Link to="/sertifikatlar" className="text-sm text-slate-500 hover:text-primary">← Sertifikatlar</Link>
        <Button onClick={() => window.print()}><Printer className="h-4 w-4" /> PDF sifatida saqlash</Button>
      </div>
      <p className="text-xs text-slate-500 print:hidden">Chop etish oynasida "Printer" o‘rniga "PDF sifatida saqlash" ni tanlang; yo‘nalish: Landshaft (gorizontal).</p>

      <section aria-label="Sertifikat" className="relative mx-auto aspect-[1.414/1] w-full overflow-hidden rounded-2xl border-[10px] border-double border-primary bg-white p-8 text-center text-slate-900 shadow-soft print:rounded-none print:shadow-none sm:p-12">
        <div className="flex h-full flex-col items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.3em] text-primary">FRONTEND EDU</p>
            <h1 className="mt-2 text-3xl font-bold uppercase tracking-wide text-slate-900 sm:text-5xl">Sertifikat</h1>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Ushbu sertifikat</p>
            <p className="text-2xl font-bold text-primary sm:text-4xl">{data.full_name || "Ism kiritilmagan"}</p>
            <p className="mx-auto max-w-xl text-sm text-slate-700 sm:text-base">
              «{data.course_title}» ({data.total_hours} soatlik) kursini muvaffaqiyatli tamomlagani uchun topshiriladi.
            </p>
          </div>
          <div className="flex w-full items-end justify-between gap-4 text-left text-xs text-slate-600 sm:text-sm">
            <div>
              <p>Sana: <b>{formatDate(data.issued_at)}</b></p>
              <p>Raqam: <b className="font-mono">{data.certificate_no}</b></p>
              <p>Muallif: <b>{data.author_name || "Mansur Murodov"}</b></p>
            </div>
            <div className="text-center">
              {qr && <img src={qr} alt="Sertifikatni tekshirish uchun QR kod" width={96} height={96} className="mx-auto h-20 w-20 sm:h-24 sm:w-24" />}
              <p className="mt-1 text-[10px]">Tekshirish uchun skanerlang</p>
            </div>
          </div>
        </div>
      </section>
      <p className="break-all text-center text-xs text-slate-500">Tekshirish havolasi: {verifyUrl}</p>
    </div>
  );
}
