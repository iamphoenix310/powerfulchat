"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { X, Filter, ChevronDown, Check, ChevronsUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type PeopleFilterInput = {
  name?: string
  country?: string
  ethnicity?: string
  gender?: string
  eyeColor?: string
  hairColor?: string
  bodyType?: string
  isDead?: "true" | "false"
}

interface AdvancedPeopleFiltersProps {
  onFilterChange: (filters: PeopleFilterInput) => void
  initialFilters?: PeopleFilterInput; // Will be updated from URL-driven state in PeoplePage
}

const FILTER_OPTIONS = {
  country: ["India", "USA", "UK", "Canada", "France", "Germany", "Australia"],
  ethnicity: [
    "British English", "South Asian", "Latino", "Latina", "Indian", "Asian",
    "American", "European", "Caucasian", "Hispanic", "Jewish",
    "Middle Eastern", "White", "Black", "Hispanic-American", "African", "Mixed",
  ],
  gender: ["Male", "Female"],
  eyeColor: ["Brown", "Blue", "Green", "Hazel", "Grey"],
  hairColor: ["Black", "Brown", "Blonde", "Red", "Bald", "Grey", "White"],
  bodyType: ["Muscular", "Slim", "Average", "Curvy", "Athletic", "Heavy"],
}

interface ComboboxFilterProps {
  title: string;
  options: string[];
  value: string; 
  onChange: (value: string) => void; 
  placeholder?: string;
}

const ComboboxFilter: React.FC<ComboboxFilterProps> = ({ title, options, value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]); 

  useEffect(() => {
    if (open) {
      if (value !== inputValue) {
        setInputValue(value || "");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); 


  const handleValueCommit = (valToCommit: string) => {
    const trimmedToCommit = valToCommit.trim();
    console.log(`[ComboboxFilter - ${title}] Attempting to commit: '${trimmedToCommit}'. Current prop 'value': '${value}'`);
    
    setInputValue(trimmedToCommit);

    if (trimmedToCommit !== value) {
      console.log(`[ComboboxFilter - ${title}] Value changed. Calling onChange with '${trimmedToCommit}'`);
      onChange(trimmedToCommit); 
    } else {
      console.log(`[ComboboxFilter - ${title}] Value not changed ('${trimmedToCommit}' === '${value}'). Not calling onChange.`);
    }
    setOpen(false); 
  };

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">
        {title}
      </label>
      <Popover open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
          console.log(`[ComboboxFilter - ${title}] Popover closing via onOpenChange. Committing inputValue: '${inputValue}'`);
          handleValueCommit(inputValue); 
        }
        setOpen(isOpen);
      }}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between text-xs font-normal",
              value ? "text-zinc-800 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"
            )}
            onClick={() => {
              setOpen(!open);
            }}
          >
            <span className="truncate">
              {value || placeholder || `Select or type ${title.toLowerCase()}`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput
              value={inputValue}
              onValueChange={(currentSearchText) => {
                setInputValue(currentSearchText);
              }}
              placeholder={placeholder || `Search or add ${title.toLowerCase()}...`}
              className="h-8 text-xs rounded-t-md"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  console.log(`[ComboboxFilter - ${title}] Enter pressed in CommandInput. Committing inputValue: '${inputValue}'`);
                  handleValueCommit(inputValue);
                } else if (e.key === 'Escape') {
                  console.log(`[ComboboxFilter - ${title}] Escape pressed. Closing popover without explicit commit.`);
                  setOpen(false);
                }
              }}
            />
            <CommandList>
              <CommandEmpty>
                {inputValue.trim() === "" ? "Type to search." : `No match. Press Enter or click "Add" to use.`}
              </CommandEmpty>
              <CommandGroup>
                {inputValue.trim() && !options.some(opt => opt.toLowerCase() === inputValue.trim().toLowerCase()) && (
                    <CommandItem
                        key={`add-${inputValue.trim()}`}
                        value={inputValue.trim()} 
                        onSelect={() => {
                             console.log(`[ComboboxFilter - ${title}] Custom 'Add' item selected: '${inputValue.trim()}'`);
                             handleValueCommit(inputValue.trim())
                        }}
                        className="text-xs italic"
                      >
                        <Check className={cn("mr-2 h-4 w-4", "opacity-0")} /> 
                        Add: {inputValue.trim().length > 20 ? inputValue.trim().substring(0,17) + '...' : inputValue.trim()}
                      </CommandItem>
                )}
                {options
                  .filter(option => option.toLowerCase().includes(inputValue.toLowerCase()))
                  .map((option) => (
                  <CommandItem
                    key={option}
                    value={option} 
                    onSelect={() => {
                      console.log(`[ComboboxFilter - ${title}] Predefined option selected: '${option}'`);
                      handleValueCommit(option); 
                    }}
                    className="text-xs"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        option.toLowerCase() === value?.toLowerCase() ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const AdvancedPeopleFilters: React.FC<AdvancedPeopleFiltersProps> = ({ onFilterChange, initialFilters = {} }) => {
  const [localFilters, setLocalFilters] = useState<PeopleFilterInput>(initialFilters)
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  const [searchInput, setSearchInput] = useState(initialFilters.name || "")
  const searchInputDebounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    console.log("[AdvancedFilters] initialFilters prop changed (from URL-driven state):", initialFilters);
    setLocalFilters(initialFilters); // Sync local state with filters derived from URL
    setSearchInput(initialFilters.name || "");
  }, [initialFilters]);
  
  useEffect(() => {
    if (localFilters.name !== searchInput && (localFilters.name || searchInput)) { 
        setSearchInput(localFilters.name || "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFilters.name]);


  useEffect(() => {
    const count = Object.keys(localFilters).filter(key => {
      const value = localFilters[key as keyof PeopleFilterInput]
      return value !== undefined && value !== null && (typeof value === 'string' ? value.trim() !== '' : true)
    }).length
    setActiveFilterCount(count);
  }, [localFilters]);

  const handleLocalChange = useCallback((key: keyof PeopleFilterInput, value: string | boolean | null | undefined) => {
    console.log(`[AdvancedFilters] handleLocalChange called. Key: ${key}, Value:`, value);
    setLocalFilters((prevFilters) => {
      // console.log(`[AdvancedFilters] setLocalFilters updater. Key: ${key}, NewVal: ${String(value)}. PrevFilters:`, JSON.parse(JSON.stringify(prevFilters)));
      const updatedFilters: PeopleFilterInput = { ...prevFilters };
      const normalizedValue = typeof value === 'string' ? value.trim() : value;

      if (normalizedValue === "" || normalizedValue === undefined || normalizedValue === null) {
        if (updatedFilters[key] !== undefined) {
            delete updatedFilters[key];
        }
      } else {
        const strValue = typeof normalizedValue === 'boolean' ? String(normalizedValue) : normalizedValue;
        if (updatedFilters[key] !== strValue) {
            if (key === "isDead") {
                if (strValue === "true" || strValue === "false") {
                    updatedFilters.isDead = strValue;
                } else {
                    delete updatedFilters.isDead;
                }
            } else {
                updatedFilters[key as Exclude<keyof PeopleFilterInput, 'isDead'>] = strValue;
            }
        }
      }
      // console.log(`[AdvancedFilters] setLocalFilters updater. Returning updatedFilters:`, JSON.parse(JSON.stringify(updatedFilters)));
      return updatedFilters;
    })
  }, [])

  const handleMainSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value) 

    if (searchInputDebounceTimeoutRef.current) {
      clearTimeout(searchInputDebounceTimeoutRef.current)
    }
    searchInputDebounceTimeoutRef.current = setTimeout(() => {
      handleLocalChange("name", value.trim())
    }, 300)
  }

  // This function is now passed to PeoplePage, which will then update the URL
  const handleApplyFilters = useCallback(() => {
    console.log("[AdvancedFilters] 'Apply Filters' button clicked. Calling onFilterChange with localFilters:", localFilters);
    onFilterChange(localFilters) // This will trigger URL update in PeoplePage
  }, [localFilters, onFilterChange])

  const handleReset = useCallback(() => {
    console.log("[AdvancedFilters] 'Reset' button clicked. Clearing localFilters and calling onFilterChange with {}.");
    setLocalFilters({}) // Clear local UI state
    setSearchInput("")
    onFilterChange({}) // Tell parent to clear filters (which will update URL to empty)
  }, [onFilterChange])

  const removeFilter = useCallback((key: keyof PeopleFilterInput) => {
    // console.log(`[AdvancedFilters] Removing filter badge for key: ${key}. This calls handleLocalChange with null.`);
    handleLocalChange(key, null); 
  }, [handleLocalChange])

  return (
    <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-700 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b dark:border-zinc-700 flex items-center justify-between">
        {/* ... (header same as before) ... */}
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
          <h2 className="font-semibold text-lg text-zinc-800 dark:text-zinc-100">Filters</h2>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleReset} aria-label="Reset all filters">
              Reset
              <X className="ml-1 h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} aria-expanded={isExpanded} aria-controls="advanced-filters-panel" className="lg:hidden">
            <ChevronDown className={cn("h-5 w-5 transition-transform", isExpanded ? "rotate-180" : "")} />
          </Button>
        </div>
      </div>

      <div className="p-4 border-b dark:border-zinc-700">
        {/* ... (main search input same as before) ... */}
        <Input
          type="text"
          placeholder="Search by name..."
          value={searchInput}
          onChange={handleMainSearchInputChange}
          className="w-full text-base"
          aria-label="Search by name"
        />
      </div>
      
      <div className={cn("transition-all duration-300 ease-in-out overflow-hidden", isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 lg:max-h-[2000px] lg:opacity-100")}>
        {/* ... (filter items using ComboboxFilter same as before) ... */}
        <div id="advanced-filters-panel" className="p-4 grid grid-cols-1 gap-y-4 gap-x-4">
          <ComboboxFilter
            title="Country"
            options={FILTER_OPTIONS.country}
            value={localFilters.country || ""}
            onChange={(value) => handleLocalChange("country", value)}
          />
          <ComboboxFilter
            title="Ethnicity"
            options={FILTER_OPTIONS.ethnicity}
            value={localFilters.ethnicity || ""}
            onChange={(value) => handleLocalChange("ethnicity", value)}
          />
          <ComboboxFilter
            title="Gender"
            options={FILTER_OPTIONS.gender}
            value={localFilters.gender || ""}
            onChange={(value) => handleLocalChange("gender", value)}
          />
          <ComboboxFilter
            title="Eye Color"
            options={FILTER_OPTIONS.eyeColor}
            value={localFilters.eyeColor || ""}
            onChange={(value) => handleLocalChange("eyeColor", value)}
          />
          <ComboboxFilter
            title="Hair Color"
            options={FILTER_OPTIONS.hairColor}
            value={localFilters.hairColor || ""}
            onChange={(value) => handleLocalChange("hairColor", value)}
          />
          <ComboboxFilter
            title="Body Type"
            options={FILTER_OPTIONS.bodyType}
            value={localFilters.bodyType || ""}
            onChange={(value) => handleLocalChange("bodyType", value)}
          />
          <ComboboxFilter 
            title="Status"
            options={["Living", "Deceased"]}
            value={localFilters.isDead === "true" ? "Deceased" : localFilters.isDead === "false" ? "Living" : ""}
            onChange={(value) => { 
              if (value === "Living") handleLocalChange("isDead", "false")
              else if (value === "Deceased") handleLocalChange("isDead", "true")
              else handleLocalChange("isDead", null) 
            }}
            placeholder="Select status"
          />
        </div>
      </div>

      {activeFilterCount > 0 && (
        // ... (active filter badges display same as before) ...
        <div className="p-4 flex flex-wrap gap-2 border-t dark:border-zinc-700">
          {Object.entries(localFilters).map(([key, filterVal]: [string, string | "true" | "false" | undefined]) => {
            if (filterVal && filterVal.trim() !== "") { 
              let displayValue: string = String(filterVal);
              if (key === "isDead") {
                displayValue = filterVal === "true" ? "Deceased" : "Living";
              }
              if (key === "name" && searchInput.trim().toLowerCase() === String(filterVal).toLowerCase()) {
                return null; 
              }
              const filterKeyDisplay = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
              return (
                <Badge key={key} variant="outline" className="flex items-center gap-1.5 py-1 px-2 text-xs">
                  <span className="font-medium">{filterKeyDisplay}:</span> {displayValue}
                  <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => removeFilter(key as keyof PeopleFilterInput)} aria-label={`Remove ${displayValue} filter`} />
                </Badge>
              );
            }
            return null;
          })}
        </div>
      )}

      <div className="p-4 border-t dark:border-zinc-700 flex justify-end">
        {/* ... (Apply Filters button same as before) ... */}
        <Button onClick={handleApplyFilters} className="w-full sm:w-auto">
          Apply Filters
          {activeFilterCount > 0 && <span className="ml-2 h-5 w-5 bg-primary-foreground text-primary rounded-full text-xs flex items-center justify-center">{activeFilterCount}</span>}
          <Check className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}