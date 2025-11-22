import * as React from "react";
import { Check, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Block } from "./types/types";


interface BlockSelectorProps {
  availableBlocks: Block[];           // Now comes as prop
  selectedBlocks: string[];
  onBlocksChange: (blocks: string[]) => void;
  label?: string;
  className?: string;
  compact?: boolean;
  showFilterChip?: boolean;
}

export function BlockSelector({
  availableBlocks,
  selectedBlocks,
  onBlocksChange,
  label = "Block",
  className,
  compact = false,
  showFilterChip = false,
}: BlockSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const toggleBlock = (blockId: string) => {
    const block = availableBlocks.find((b) => b.block_id === blockId);
    if (!block) return;

    const blockName = block?.block_name;
    const newSelection = selectedBlocks.includes(blockName)
      ? selectedBlocks.filter((name) => name !== blockName)
      : [...selectedBlocks, blockName];
    onBlocksChange(newSelection);
    //close the popover after selection
    setOpen(false)
  };

  const clearAll = () => {
    onBlocksChange([]);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "justify-between bg-background",
              compact ? "h-8 px-2 text-xs" : "h-9 px-3"
            )}
          >
            <span className="truncate">
              {selectedBlocks.length > 0
                ? `${selectedBlocks.length} ${label}${selectedBlocks.length !== 1 ? "s" : ""} selected`
                : `Select ${label}${compact ? "" : "s"}`}
            </span>
            <ChevronDown
              className={cn(
                "ml-2 h-4 w-4 shrink-0 opacity-50",
                compact ? "h-3 w-3" : ""
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder={`Search ${label.toLowerCase()}s...`} />
            <CommandList>
              <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
              <CommandGroup>
                {availableBlocks.map((block) => (
                  <CommandItem
                    key={block.block_id}
                    value={block.block_name}
                    onSelect={() => toggleBlock(block.block_id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedBlocks.includes(block.block_name) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{block.block_name}</span>
                      {block.location && (
                        <span className="text-xs text-muted-foreground">{block.location}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {showFilterChip && selectedBlocks.length > 0 && (
        <Badge
          variant="secondary"
          className="cursor-pointer gap-1 pl-2 pr-3 py-1 rounded-full text-xs font-normal hover:bg-secondary/80"
          onClick={clearAll}
        >
          <X className="h-3.5 w-3.5" />
          {selectedBlocks.length} {label}
          {selectedBlocks.length !== 1 ? "s" : ""} selected
        </Badge>
      )}
    </div>
  );
}
