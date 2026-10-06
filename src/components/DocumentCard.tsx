import { Building2, CalendarDays, FileText } from 'lucide-react'
import type { CitizenDocument } from '@/types'
import { formatDate } from '@/lib/fields'
import StatusBadge from './StatusBadge'

export default function DocumentCard({ doc }: { doc: CitizenDocument }) {
  const verified = doc.verification_status === 'Verified'
  return (
    <article className="card flex flex-col p-4">
      <div className="flex items-start gap-3">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          <FileText className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-900">{doc.document_type}</h3>
          <p className="truncate font-mono text-xs text-slate-500" title={doc.document_name}>{doc.document_name}</p>
        </div>
      </div>
      <div className="mt-3"><StatusBadge status={doc.verification_status} /></div>
      <dl className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
        <div className="flex items-start gap-2"><Building2 className="mt-px size-3.5 shrink-0 text-slate-400" aria-hidden /><dt className="sr-only">Issued by</dt><dd>{doc.issuing_authority}</dd></div>
        <div className="flex items-center gap-2"><CalendarDays className="size-3.5 text-slate-400" aria-hidden /><dt className="sr-only">Uploaded</dt><dd>Uploaded {formatDate(doc.uploaded_at)} · {doc.file_size_kb} KB</dd></div>
      </dl>
    </article>
  )
}
