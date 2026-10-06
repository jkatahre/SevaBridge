import { Award, Briefcase, FileBadge, GraduationCap, HandCoins, HeartPulse, Home, Users, type LucideIcon } from 'lucide-react'
import type { ServiceCategory } from '@/types'

export const CATEGORY_ICONS: Record<ServiceCategory, LucideIcon> = {
  Education: GraduationCap,
  Scholarships: Award,
  Employment: Briefcase,
  Certificates: FileBadge,
  Healthcare: HeartPulse,
  'Financial Assistance': HandCoins,
  Housing: Home,
  'Social Welfare': Users,
}

export function CategoryIcon({ category, className }: { category: ServiceCategory; className?: string }) {
  const Icon = CATEGORY_ICONS[category]
  return <Icon className={className} aria-hidden />
}
