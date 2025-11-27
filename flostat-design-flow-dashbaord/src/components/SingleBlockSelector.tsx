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

interface SingleBlockSelectorProps {
  availableBlocks: Block[];
  selectedBlock?: string; // Single block_id
  onBlockChange: (blockId: string | undefined) => void;
  label?: string;
  className?: string;
  compact?: boolean;
  showFilterChip?: boolean;
}

export function SingleBlockSelector({
  availableBlocks,
  selectedBlock,
  onBlockChange,
  label = "Block",
  className,
  compact = false,
  showFilterChip = false,
}: SingleBlockSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const selectBlock = (blockId: string) => {
    onBlockChange(blockId);
    setOpen(false);
  };

  const clear = () => {
    onBlockChange(undefined);
  };

  const selectedBlockData = availableBlocks.find(b => b.block_id === selectedBlock);

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
              {selectedBlockData
                ? selectedBlockData.block_name
                : `Select ${label}`}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
              <CommandGroup>
                {availableBlocks.map((block) => (
                  <CommandItem
                    key={block.block_id}
                    value={block.block_name}
                    onSelect={() => selectBlock(block.block_id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedBlock === block.block_id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{block.block_name}</span>
                      {block.location && (
                        <span className="text-xs text-muted-foreground">
                          {block.location}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {showFilterChip && selectedBlock && (
        <Badge
          variant="secondary"
          className="cursor-pointer gap-1 pl-2 pr-3 py-1 rounded-full text-xs font-normal hover:bg-secondary/80"
          onClick={clear}
        >
          <X className="h-3.5 w-3.5" />
          {selectedBlockData?.block_name}
        </Badge>
      )}
    </div>
  );
}
