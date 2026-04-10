"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function BreadCrumbs () {
  const pathName = usePathname().split('/').filter(Boolean)

  const crumbs = pathName.map((path, index) => {
    if (index === pathName.length - 1) {
      return (
        <div key={path} className="flex items-center pointer-events-none">
          <span className="text-lg">/ </span> <span className="text-sm text-gray-400">{path}</span>
        </div>
      )
    }
    else {
      return (
        <div key={path} className="flex items-center">
          <span className="text-lg">/</span>
          <Link href={`/${path}`} className="hover:text-amber-600 text-sm">{path}</Link>
        </div>
      )
    }
  })
    
  return (
    <nav className="breadCrumbs flex flex-wrap items-center mb-6">
      <div className="flex items-center">
        <Link href={'/'} className="hover:text-amber-600 text-sm">Главная</Link>
      </div>
      {crumbs}
    </nav>
  )
}
