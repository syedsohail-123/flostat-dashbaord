import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateBlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateBlock: (block: { name: string; location: string; description: string }) => void;
}

export function CreateBlockModal({ open, onOpenChange, onCreateBlock }: CreateBlockModalProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && location.trim()) {
      onCreateBlock({ name, location, description });
      setName("");
      setLocation("");
      setDescription("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create Block</DialogTitle>
          <DialogDescription>
            Add a new block to organize your devices. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="block-name" className="text-sm font-medium">
                Block Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="block-name"
                placeholder="e.g., Block E"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="block-location" className="text-sm font-medium">
                Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="block-location"
                placeholder="e.g., Building E - Floor 2"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="block-description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="block-description"
                placeholder="Optional description of the block..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || !location.trim()}
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
            >
              Create Block
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
