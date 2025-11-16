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

interface Block {
  id: string;
  name: string;
  location?: string;
}

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
  const [availableBlocks, setAvailableBlocks] = React.useState<Block[]>([]);

  // Load blocks from localStorage
  React.useEffect(() => {
    const loadBlocks = () => {
      const storedBlocks = localStorage.getItem('blocks');
      if (storedBlocks) {
        setAvailableBlocks(JSON.parse(storedBlocks));
      } else {
        // Default blocks if none exist
        const defaultBlocks: Block[] = [
          { id: "block-a", name: "Block A", location: "Building A" },
          { id: "block-b", name: "Block B", location: "Building B" },
        ];
        setAvailableBlocks(defaultBlocks);
        localStorage.setItem('blocks', JSON.stringify(defaultBlocks));
      }
    };

    // Load blocks initially
    loadBlocks();

    // Listen for storage changes from other parts of the app
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'blocks') {
        loadBlocks();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Also listen for custom events within the same tab
  React.useEffect(() => {
    const handleBlocksUpdate = () => {
      const storedBlocks = localStorage.getItem('blocks');
      if (storedBlocks) {
        setAvailableBlocks(JSON.parse(storedBlocks));
      }
    };

    window.addEventListener('blocksUpdated', handleBlocksUpdate);
    
    // Cleanup listener
    return () => {
      window.removeEventListener('blocksUpdated', handleBlocksUpdate);
    };
  }, []);

  const toggleBlock = (blockId: string) => {
    // Find the block name by ID
    const block = availableBlocks.find(b => b.id === blockId);
    if (!block) return;
    
    const blockName = block.name;
    const newSelection = selectedBlocks.includes(blockName)
      ? selectedBlocks.filter((name) => name !== blockName)
      : [...selectedBlocks, blockName];
    onBlocksChange(newSelection);
  };

  const clearAll = () => {
    onBlocksChange([]);
  };

  // Find block names for display
  const getBlockName = (blockName: string) => {
    // In this updated version, we're passing block names, not IDs
    return blockName;
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
            <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50", compact ? "h-3 w-3" : "")} />
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
                    key={block.id}
                    value={block.name}
                    onSelect={() => toggleBlock(block.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedBlocks.includes(block.name) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{block.name}</span>
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