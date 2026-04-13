import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EntityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}

export function EntityModal({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  isSubmitting,
  onCancel,
  onSubmit,
  children
}: EntityModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-0 right-0 top-0 flex h-[100dvh] w-screen max-h-[100dvh] max-w-none translate-x-0 translate-y-0 flex-col overflow-hidden rounded-none p-0 data-[state=open]:slide-in-from-right-full data-[state=closed]:slide-out-to-right-full md:left-64 md:w-[calc(100vw-16rem)]">
        <DialogHeader>
          <div className="space-y-1 border-b border-border/60 px-4 pb-4 pt-5 sm:px-6">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </div>
        </DialogHeader>
        <div className="max-h-[calc(100dvh-10.5rem)] overflow-y-auto px-4 py-4 sm:px-6">
          <div className="space-y-4">{children}</div>
        </div>
        <DialogFooter className="mt-auto border-t border-border/60 bg-background px-4 py-3 sm:px-6">
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
