import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface LaunchAgentDialogProps {
  issueNumber: number;
  issueTitle: string;
  repository: string;
  onLaunch: (customInstructions: string) => Promise<void>;
  triggerButton?: React.ReactNode;
}

export const LaunchAgentDialog: React.FC<LaunchAgentDialogProps> = ({
  issueNumber,
  issueTitle,
  repository,
  onLaunch,
  triggerButton,
}) => {
  const [open, setOpen] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLaunch = async () => {
    setLoading(true);
    try {
      await onLaunch(customInstructions);
      setOpen(false);
      setCustomInstructions('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {triggerButton || (
          <Button className="border-2 border-black bg-[var(--metis-orange)] font-bold text-white shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000]">
            Launch Agent
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl gap-0 overflow-hidden border-2 border-black bg-white p-0 shadow-[8px_8px_0px_0px_#000]">
        <AlertDialogHeader className="border-b-2 border-black bg-[var(--metis-pastel-1)] p-6">
          <AlertDialogTitle className="flex items-center gap-2 text-2xl font-black">
            Launch Agent
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2 text-base text-black/60">
            The agent will analyze <span className="font-bold text-black">#{issueNumber}</span> and
            create a pull request with proposed fixes.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 p-6">
          <div className="rounded-lg border-2 border-black bg-[var(--metis-pastel-2)] p-4">
            <p className="mb-1 text-xs font-bold tracking-wider text-[var(--metis-red)] uppercase">
              Target Issue
            </p>
            <p className="text-lg font-bold text-black">{issueTitle}</p>
            <p className="mt-1 font-mono text-sm text-black/70">{repository}</p>
          </div>

          <div>
            <Label htmlFor="instructions" className="mb-2 block text-base font-black">
              Custom Instructions
            </Label>
            <div className="relative">
              <Textarea
                id="instructions"
                placeholder="e.g. 'Focus on performance', 'Use a specific library', 'Don't change the API'..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="min-h-[150px] resize-none rounded-lg border-2 border-black p-4 text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all focus:shadow-[4px_4px_0px_0px_#000]"
              />
              <div className="pointer-events-none absolute right-3 bottom-3 text-xs font-bold text-black/40">
                OPTIONAL
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="items-center border-t-2 border-black bg-[var(--metis-pastel-1)] p-6 sm:justify-between">
          <div className="hidden text-xs font-bold text-black/60 sm:block">
            * This may take a few minutes
          </div>
          <div className="flex w-full gap-3 sm:w-auto">
            <AlertDialogCancel
              disabled={loading}
              className="flex-1 border-2 border-black font-bold hover:bg-white sm:flex-none"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLaunch}
              disabled={loading}
              className="flex-1 border-2 border-black bg-[var(--metis-orange)] font-bold text-white shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000] sm:flex-none"
            >
              {loading ? 'Launching...' : 'Start Agent'}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
