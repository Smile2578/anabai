// components/ui/date-range-picker.tsx
"use client"

import * as React from "react"
import { addDays, format, isBefore, isValid, parse } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange, SelectRangeEventHandler } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

export interface DatePickerWithRangeProps {
  className?: string;
  date?: DateRange;
  setDate: (date: DateRange | undefined) => void;
  // Nouvelle prop pour gérer les dates minimales et maximales
  minDate?: Date;
  maxDate?: Date;
  // Nouvelle prop pour personnaliser le nombre de mois affichés
  numberOfMonths?: number;
}

export function DatePickerWithRange({
  className,
  date,
  setDate,
  // Valeurs par défaut pour les dates limites et le nombre de mois
  minDate = new Date(),
  maxDate = addDays(new Date(), 365),
  numberOfMonths = 2,
}: DatePickerWithRangeProps) {
  // État local pour gérer la saisie manuelle des dates
  const [fromInput, setFromInput] = React.useState<string>(
    date?.from ? format(date.from, "dd/MM/yyyy") : ""
  )
  const [toInput, setToInput] = React.useState<string>(
    date?.to ? format(date.to, "dd/MM/yyyy") : ""
  )

  // Référence pour le popover
  const popoverRef = React.useRef<HTMLDivElement>(null)

  // Fonction pour formater la date en texte complet
  const formatDateDisplay = (date: Date) => {
    return format(date, "d MMMM yyyy", { locale: fr })
  }

  // Gestionnaire de sélection de dates dans le calendrier
  const handleSelect: SelectRangeEventHandler = (range) => {
    setDate(range)
    if (range?.from) {
      setFromInput(format(range.from, "dd/MM/yyyy"))
    }
    if (range?.to) {
      setToInput(format(range.to, "dd/MM/yyyy"))
    }
  }

  // Gestionnaire de saisie manuelle des dates
  const handleInputChange = (value: string, isStart: boolean) => {
    // Mise à jour de l'input
    if (isStart) {
      setFromInput(value)
    } else {
      setToInput(value)
    }

    try {
      // Tentative de parsing de la date
      const parsedDate = parse(value, "dd/MM/yyyy", new Date())
      
      if (isValid(parsedDate)) {
        // Vérification que la date est dans les limites
        if (isBefore(parsedDate, minDate) || isBefore(maxDate, parsedDate)) {
          return
        }

        // Mise à jour de la plage de dates
        if (isStart) {
          setDate({
            from: parsedDate,
            to: date?.to,
          })
        } else {
          // Vérification que la date de fin est après la date de début
          if (date?.from && isBefore(parsedDate, date.from)) {
            return
          }
          setDate({
            from: date?.from,
            to: parsedDate,
          })
        }
      }
    } catch (error) {
      // En cas d'erreur de parsing, on ne fait rien
      console.debug('Date parsing error:', error)
    }
  }

  // Effet pour mettre à jour les inputs quand les dates changent
  React.useEffect(() => {
    if (date?.from) {
      setFromInput(format(date.from, "dd/MM/yyyy"))
    }
    if (date?.to) {
      setToInput(format(date.to, "dd/MM/yyyy"))
    }
  }, [date])

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  Du {formatDateDisplay(date.from)} au{" "}
                  {formatDateDisplay(date.to)}
                </>
              ) : (
                <>
                  Début: {formatDateDisplay(date.from)}
                  {" - "}
                  <span className="text-muted-foreground">Sélectionnez la fin</span>
                </>
              )
            ) : (
              <span>Sélectionnez vos dates de voyage</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0" 
          align="center"
          ref={popoverRef}
        >
          {/* Inputs de saisie manuelle au-dessus des mois */}
          <div className="p-3 border-b">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-center">
                <label className="text-sm font-medium text-secondary">Date de début</label>
                <Input
                  placeholder="JJ/MM/AAAA"
                  value={fromInput}
                  onChange={(e) => handleInputChange(e.target.value, true)}
                  className="text-center"
                />
              </div>
              <div className="space-y-1 text-center">
                <label className="text-sm font-medium text-secondary">Date de fin</label>
                <Input
                  placeholder="JJ/MM/AAAA"
                  value={toInput}
                  onChange={(e) => handleInputChange(e.target.value, false)}
                  className="text-center"
                />
              </div>
            </div>
          </div>

          {/* Calendrier */}
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={numberOfMonths}
            locale={fr}
            disabled={(date) => 
              isBefore(date, minDate) || isBefore(maxDate, date)
            }
            classNames={{
              months: "flex flex-col md:flex-row space-y-4 md:space-x-4 md:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
              ),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
              day: cn(
                "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              ),
              day_range_start: "day-range-start rounded-l-md bg-primary text-primary-foreground",
              day_range_end: "day-range-end rounded-r-md bg-primary text-primary-foreground",
              day_range_middle: "day-range-middle bg-accent/50",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_hidden: "invisible",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}