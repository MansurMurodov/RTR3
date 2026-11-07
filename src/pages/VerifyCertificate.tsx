import { Link, useParams } from "react-router-dom";
import { BadgeCheck, ShieldX } from "lucide-react";
import { Spinner, ErrorState } from "../components/ui/State";
import { supabase } from "../lib/supabase";
import { unwrap, useAsync } from "../lib/useAsync";
import { formatDate, type CertificateInfo } from "../lib/types";

export default function VerifyCertificate() {
  const { code = "" } = useParams();
  const { data, loading, error, reload } = useAsync(async () => {
    const rows = unwrap(await supabase.rpc("verify_certificate", { p_code: code })) as CertificateInfo[];
    return rows[0] ?? null;
  }, [code]);

  if (loading) return <div className="container-page"><Spinner /></div>;
  if (error) return <div className="container-page py-10"><ErrorState message={error} onRetry={reload} /></div>;

  return (
    <div className="container-page grid place-items-center py-14">
      <div className="card w-full max-w-lg space-y-3 text-center">
        {data ? (
          <>
            <BadgeCheck className="mx-auto h-12 w-12 text-secondary" />
            <h1 className="text-2xl font-bold">Sertifikat haqiqiy</h1>
            <dl className="space-y-1 text-sm">
              <div><dt className="text-slate-500">Egasi</dt><dd className="font-semibold">{data.full_name}</dd></div>
              <div><dt className="text-slate-500">Kurs</dt><dd className="font-semibold">{data.course_title} ({data.total_hours} soat)</dd></div>
              <div><dt className="text-slate-500">Raqam</dt><dd className="font-mono font-semibold">{data.certificate_no}</dd></div>
              <div><dt className="text-slate-500">Berilgan sana</dt><dd className="font-semibold">{formatDate(data.issued_at)}</dd></div>
            </dl>
          </>
        ) : (
          <>
            <ShieldX className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="text-2xl font-bold">Sertifikat topilmadi</h1>
            <p className="text-sm text-slate-500">Kiritilgan kod bo‘yicha sertifikat mavjud emas.</p>
          </>
        )}
        <Link to="/" className="text-sm text-primary underline">Bosh sahifa</Link>
      </div>
    </div>
  );
}
