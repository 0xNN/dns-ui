'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { formatDateKey, parseDateValue } from '@/lib/data-table/filter-utils'

import { useFilters } from '../contexts/FilterContext'

interface DateRangeFilterProps {
  field: string
  label: string
}

function getRangeLabel(range?: DateRange) {
  if (!range?.from) return 'Pick a date range'
  if (!range.to) return format(range.from, 'dd MMM yyyy')
  return `${format(range.from, 'dd MMM yyyy')} - ${format(range.to, 'dd MMM yyyy')}`
}

export function DateRangeFilter({ field, label }: DateRangeFilterProps) {
  const { filters, addFilter, removeFilter } = useFilters()

  const existingFilter = filters.find((filter) => filter.field === field && filter.type === 'dateRange')
  const initialValue = existingFilter?.value as [string, string] | undefined

  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(
    initialValue?.[0] && initialValue?.[1]
      ? {
          from: parseDateValue(initialValue[0]) ?? undefined,
          to: parseDateValue(initialValue[1]) ?? undefined,
        }
      : undefined
  )

  useEffect(() => {
    const value = existingFilter?.value as [string, string] | undefined

    if (!value?.[0] || !value?.[1]) {
      setSelectedRange(undefined)
      return
    }

    setSelectedRange({
      from: parseDateValue(value[0]) ?? undefined,
      to: parseDateValue(value[1]) ?? undefined,
    })
  }, [existingFilter?.value])

  const handleSelect = (range: DateRange | undefined) => {
    setSelectedRange(range)

    if (range?.from && range?.to) {
      const fromValue = formatDateKey(range.from)
      const toValue = formatDateKey(range.to)
      if (!fromValue || !toValue) {
        removeFilter(field)
        return
      }

      removeFilter(field)
      addFilter({
        field,
        operator: 'dateRange',
        value: [fromValue, toValue],
        type: 'dateRange',
      })
      return
    }

    removeFilter(field)
  }

  const handleClear = () => {
    setSelectedRange(undefined)
    removeFilter(field)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {selectedRange?.from && (
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
              !selectedRange?.from && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{getRangeLabel(selectedRange)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[100]" align="start">
          <Calendar
            mode="range"
            selected={selectedRange}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
