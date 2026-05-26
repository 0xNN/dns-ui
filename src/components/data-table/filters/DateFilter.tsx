import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { useFilters } from '../contexts/FilterContext'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { formatDateKey, parseDateValue } from '@/lib/data-table/filter-utils'

interface DateFilterProps {
  field: string;
  label: string;
}

export function DateFilter({ field, label }: DateFilterProps) {
  const { filters, addFilter, removeFilter } = useFilters()

  const existingFilter = filters.find((filter) => filter.field === field && filter.type === 'date')
  const initialValue = existingFilter?.value as string | undefined
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialValue ? parseDateValue(initialValue) ?? undefined : undefined
  )

  useEffect(() => {
    const value = existingFilter?.value as string | undefined
    if (!value) {
      setSelectedDate(undefined)
    } else {
      setSelectedDate(parseDateValue(value) ?? undefined)
    }
  }, [existingFilter?.value])

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date)

    if (date) {
      const normalizedDate = formatDateKey(date)
      if (!normalizedDate) {
        return
      }
      removeFilter(field)
      addFilter({
        field,
        operator: 'equals',
        value: normalizedDate,
        type: 'date',
      })
    } else {
      removeFilter(field)
    }
  }

  const handleClear = () => {
    setSelectedDate(undefined)
    removeFilter(field)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {selectedDate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, 'dd MMM yyyy') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[100]" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
