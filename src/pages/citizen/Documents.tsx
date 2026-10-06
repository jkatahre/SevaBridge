import { useState, type FormEvent } from 'react'
import { FileCheck2, FilePlus2, Info, Upload } from 'lucide-react'
import { api } from '@/api'
import { useApp } from '@/context/AppContext'
import { useApi } from '@/hooks/useApi'
import DocumentCard from '@/components/DocumentCard'
import Modal from '@/components/Modal'
import { CardsSkeleton, EmptyState, ErrorState, PageHeader, Spinner } from '@/components/ui'
import { CORE_DOCUMENT_TYPES } from '@/lib/profileCompletion'

const TYPES = [...CORE_DOCUMENT_TYPES, 'Caste Certificate', 'Degree Certificate', 'Disability Certificate', 'Address Proof', 'Other']

export default function Documents() {
  const { session, toast, refresh } = useApp()
  const id = session!.citizen_id!
  const docs = useApi(() => api.documents.list(id), [id])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ document_type: '', issuing_authority: '', file: null as File | null })
  const [err, setErr] = useState<string | null>(null)

  const verified = docs.data?.filter((d) => d.verification_status === 'Verified').length ?? 0
  const pending = docs.data?.filter((d) => d.verification_status === 'Pending Verification').length ?? 0
  const have = new Set(docs.data?.map((d) => d.document_type))
  const suggested = CORE_DOCUMENT_TYPES.filter((t) => !have.has(t))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.document_type || !form.file) return setErr('Choose a document type and a file to upload.')
    if (form.file.size > 5 * 1024 * 1024) return setErr('The file is larger than 5 MB. Please upload a smaller file.')
    setBusy(true)
    try {
      await api.documents.upload(id, {
        document_type: form.document_type,
        document_name: form.file.name,
        issuing_authority: form.issuing_authority || 'Self-uploaded',
        file_size_kb: Math.max(1, Math.round(form.file.size / 1024)),
      })
      refresh()
      toast('Document uploaded and sent for verification.')
      setOpen(false)
      setForm({ document_type: '', issuing_authority: '', file: null })
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Documents" description="Your verified document vault. Departments check these instead of asking for fresh copies."
        actions={<button className="btn-primary" onClick={() => { setErr(null); setOpen(true) }}><Upload className="size-4" aria-hidden />Upload document</button>} />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="card flex flex-1 items-center gap-3 p-4">
          <FileCheck2 className="size-5 text-emerald-600" aria-hidden />
          <span className="text-sm text-slate-600"><strong className="text-slate-900 tabular-nums">{verified}</strong> verified · <strong className="text-slate-900 tabular-nums">{pending}</strong> pending verification</span>
        </div>
        <div className="flex flex-1 items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          Prototype: use dummy files only. Never upload real Aadhaar or other identity documents.
        </div>
      </div>

      {docs.error ? (
        <ErrorState message={docs.error} onRetry={docs.reload} />
      ) : docs.loading ? (
        <CardsSkeleton count={6} className="h-44" />
      ) : docs.data!.length === 0 ? (
        <EmptyState icon={FilePlus2} title="No documents yet" message="Upload documents once and reuse them across every service." action={<button className="btn-primary" onClick={() => setOpen(true)}>Upload your first document</button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {docs.data!.map((d) => <DocumentCard key={d.document_id} doc={d} />)}
        </div>
      )}

      {suggested.length > 0 && docs.data && (
        <section className="mt-8">
          <h2 className="section-title">Suggested for a complete profile</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggested.map((t) => (
              <button key={t} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:border-brand-400 hover:text-brand-700"
                onClick={() => { setForm((f) => ({ ...f, document_type: t })); setErr(null); setOpen(true) }}>
                <FilePlus2 className="size-4" aria-hidden />{t}
              </button>
            ))}
          </div>
        </section>
      )}

      <Modal open={open} onClose={() => setOpen(false)} locked={busy} title="Upload document" description="Uploaded documents are sent to the Document Verification service (mock)."
        footer={<><button className="btn-secondary" onClick={() => setOpen(false)} disabled={busy}>Cancel</button><button className="btn-primary" form="upload-form" disabled={busy}>{busy ? <><Spinner /> Uploading…</> : 'Upload'}</button></>}>
        <form id="upload-form" onSubmit={submit} className="space-y-4">
          {err && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{err}</p>}
          <div>
            <label htmlFor="d-type" className="label">Document type</label>
            <select id="d-type" className="input" value={form.document_type} onChange={(e) => setForm((f) => ({ ...f, document_type: e.target.value }))}>
              <option value="">Select…</option>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="d-auth" className="label">Issuing authority (optional)</label>
            <input id="d-auth" className="input" value={form.issuing_authority} onChange={(e) => setForm((f) => ({ ...f, issuing_authority: e.target.value }))} placeholder="e.g. Tehsil Office" />
          </div>
          <div>
            <label htmlFor="d-file" className="label">File (PDF, JPG or PNG, max 5 MB)</label>
            <input id="d-file" type="file" accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
              onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))} />
          </div>
        </form>
      </Modal>
    </>
  )
}
