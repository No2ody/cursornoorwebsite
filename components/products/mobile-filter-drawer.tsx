'use client'

import { useState } from 'react'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { AdvancedFilterSidebar } from './advanced-filter-sidebar'

interface MobileFilterDrawerProps {
  activeFiltersCount?: number
}

export function MobileFilterDrawer({ activeFiltersCount = 0 }: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 relative">
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="bg-brand text-white text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-[400px] p-0 overflow-y-auto">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-brand" />
            Filter Products
            {activeFiltersCount > 0 && (
              <Badge className="bg-brand text-white">
                {activeFiltersCount}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>
        <div className="p-6">
          <AdvancedFilterSidebar />
        </div>
      </SheetContent>
    </Sheet>
  )
}
