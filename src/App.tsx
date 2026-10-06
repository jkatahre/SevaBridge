import { lazy, Suspense } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { AdminLayout, CitizenLayout, PublicLayout, RequireRole } from '@/layouts/Layouts'
import Landing from '@/pages/public/Landing'
import { Login, Register } from '@/pages/public/Auth'
import Dashboard from '@/pages/citizen/Dashboard'
import Profile from '@/pages/citizen/Profile'
import Services from '@/pages/citizen/Services'
import ServiceDetails from '@/pages/citizen/ServiceDetails'
import Apply from '@/pages/citizen/Apply'
import Applications from '@/pages/citizen/Applications'
import Schemes from '@/pages/citizen/Schemes'
import Documents from '@/pages/citizen/Documents'
import Permissions from '@/pages/citizen/Permissions'
import Notifications from '@/pages/citizen/Notifications'
import Settings from '@/pages/Settings'
import { Skeleton } from '@/components/ui'

// Admin console (and its charting library) is split into separate chunks.
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const ConnectedSystems = lazy(() => import('@/pages/admin/ConnectedSystems'))
const DataMapping = lazy(() => import('@/pages/admin/DataMapping'))
const ApiMonitoring = lazy(() => import('@/pages/admin/ApiMonitoring'))
const AdminApplications = lazy(() => import('@/pages/admin/AdminApplications'))
const AuditLogs = lazy(() => import('@/pages/admin/AuditLogs'))
const page = (el: React.ReactNode) => <Suspense fallback={<Skeleton className="h-96" />}>{el}</Suspense>

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="explore" element={<Services publicMode />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<RequireRole role="citizen" />}>
        <Route element={<CitizenLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="services" element={<Services />} />
          <Route path="services/:serviceId" element={<ServiceDetails />} />
          <Route path="services/:serviceId/apply" element={<Apply />} />
          <Route path="schemes" element={<Schemes />} />
          <Route path="applications" element={<Applications />} />
          <Route path="documents" element={<Documents />} />
          <Route path="permissions" element={<Permissions />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="admin" element={<RequireRole role="admin" />}>
        <Route element={<AdminLayout />}>
          <Route index element={page(<AdminDashboard />)} />
          <Route path="systems" element={page(<ConnectedSystems />)} />
          <Route path="mapping" element={page(<DataMapping />)} />
          <Route path="monitoring" element={page(<ApiMonitoring />)} />
          <Route path="applications" element={page(<AdminApplications />)} />
          <Route path="audit" element={page(<AuditLogs />)} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center px-4 py-24 text-center">
      <Compass className="size-12 text-slate-300" aria-hidden />
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-500">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  )
}
