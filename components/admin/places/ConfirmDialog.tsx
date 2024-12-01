// components/admin/places/ConfirmDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogOptions } from "@/hooks/places/useDialog";

interface ConfirmDialogProps {
  isOpen: boolean;
  options: DialogOptions | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({ isOpen, options, onClose, onConfirm }: ConfirmDialogProps) {
  if (!options) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{options.title}</DialogTitle>
          <DialogDescription>{options.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            {options.cancelLabel || 'Annuler'}
          </Button>
          <Button
            variant={options.variant || 'default'}
            onClick={onConfirm}
          >
            {options.confirmLabel || 'Confirmer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}