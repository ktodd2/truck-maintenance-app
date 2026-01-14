import { getCategoryInfo } from '../db/database'
import * as Icons from 'lucide-react'

export default function CategoryBadge({ category, size = 'md' }) {
  const info = getCategoryInfo(category)
  const Icon = Icons[info.icon] || Icons.Circle

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  }

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  }

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full font-medium text-white
      ${info.color} ${sizes[size]}
    `}>
      <Icon size={iconSizes[size]} />
      {info.label}
    </span>
  )
}
