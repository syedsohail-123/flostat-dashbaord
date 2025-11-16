import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface OrganizationSelectorProps {
  className?: string;
}

export function OrganizationSelector({ className }: OrganizationSelectorProps) {
  const { organizations, currentOrganization, setCurrentOrganization } = useAuth();
  const [open, setOpen] = React.useState(false);

  const handleSelect = (orgId: string) => {
    const org = organizations.find(o => o.org_id === orgId);
    if (org) {
      setCurrentOrganization(org);
      toast.success(`Switched to ${org.name}`);
    }
    setOpen(false);
  };

  // If there are no organizations or only one, don't show the selector
  if (organizations.length <= 1) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate">
              {currentOrganization ? currentOrganization.name : "Select organization"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search organization..." />
            <CommandList>
              <CommandEmpty>No organization found.</CommandEmpty>
              <CommandGroup>
                {organizations.map((org) => (
                  <CommandItem
                    key={org.org_id}
                    value={org.org_id}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        currentOrganization?.org_id === org.org_id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{org.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">{org.role}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}