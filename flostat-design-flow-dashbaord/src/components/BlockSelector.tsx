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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

const availableBlocks = [
  { id: "block-a", name: "Block A", location: "Building A" },
  { id: "block-b", name: "Block B", location: "Building B" },
  { id: "block-c", name: "Block C", location: "Building C" },
  { id: "block-d", name: "Block D", location: "Building D" },
];

interface BlockSelectorProps {
  selectedBlocks: string[];
  onBlocksChange: (blocks: string[]) => void;
  label?: string;
  className?: string;
  compact?: boolean;
  showFilterChip?: boolean;
}

export function BlockSelector({
  selectedBlocks,
  onBlocksChange,
  label = "Block",
  className,
  compact = false,
  showFilterChip = false,
}: BlockSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const toggleBlock = (blockId: string) => {
    const newSelection = selectedBlocks.includes(blockId)
      ? selectedBlocks.filter((id) => id !== blockId)
      : [...selectedBlocks, blockId];
    onBlocksChange(newSelection);
  };

  const removeBlock = (blockId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onBlocksChange(selectedBlocks.filter((id) => id !== blockId));
  };

  const displayText =
    selectedBlocks.length === 0
      ? "All Blocks"
      : selectedBlocks.length === availableBlocks.length
      ? "All Blocks"
      : `${selectedBlocks.length} Block${selectedBlocks.length > 1 ? 's' : ''}`;

  const selectedBlockNames = selectedBlocks
    .map((id) => availableBlocks.find((b) => b.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex flex-col gap-2">
        {label && !compact && <label className="text-sm font-medium">{label}</label>}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "justify-between hover:bg-muted/50",
                compact ? "h-9 w-[180px]" : "w-[240px]"
              )}
            >
              <span className="truncate text-sm">{displayText}</span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[260px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search blocks..." className="h-9" />
              <CommandList>
                <CommandEmpty>No blocks found.</CommandEmpty>
                <CommandGroup>
                  {availableBlocks.map((block) => (
                    <CommandItem
                      key={block.id}
                      value={block.name}
                      onSelect={() => toggleBlock(block.id)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedBlocks.includes(block.id)
                            ? "opacity-100 text-[hsl(var(--aqua))]"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{block.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {block.location}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {showFilterChip && selectedBlocks.length > 0 && selectedBlocks.length < availableBlocks.length && (
        <Badge
          variant="outline"
          className="gap-2 bg-[hsl(var(--aqua))]/10 text-[hsl(var(--aqua))] border-[hsl(var(--aqua))]/30 px-3 py-1 text-xs font-medium"
        >
          Filtered by: {selectedBlockNames}
          <X
            className="h-3 w-3 cursor-pointer hover:opacity-70"
            onClick={() => onBlocksChange([])}
          />
        </Badge>
      )}

      {!showFilterChip && selectedBlocks.length > 0 && selectedBlocks.length < availableBlocks.length && !compact && (
        <div className="flex flex-wrap gap-2">
          {selectedBlocks.map((blockId) => {
            const block = availableBlocks.find((b) => b.id === blockId);
            if (!block) return null;
            return (
              <Badge
                key={block.id}
                variant="outline"
                className="gap-1 bg-[hsl(var(--aqua))]/10 text-[hsl(var(--aqua))] border-[hsl(var(--aqua))]/30 hover:bg-[hsl(var(--aqua))]/20"
              >
                {block.name}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={(e) => removeBlock(block.id, e)}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { availableBlocks };
