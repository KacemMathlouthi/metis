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
          <Button className="border-2 border-black bg-[var(--metis-orange)] text-white font-bold shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] transition-all">
            Launch Agent
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl border-2 border-black shadow-[8px_8px_0px_0px_#000] p-0 gap-0 bg-white overflow-hidden">
        <AlertDialogHeader className="p-6 bg-[var(--metis-pastel-1)] border-b-2 border-black">
          <AlertDialogTitle className="text-2xl font-black flex items-center gap-2">
            Launch Agent
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-black/60 mt-2">
            The agent will analyze <span className="font-bold text-black">#{issueNumber}</span> and create a pull request with proposed fixes.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="p-6 space-y-6">
          <div className="bg-[var(--metis-pastel-2)] border-2 border-black rounded-lg p-4">
            <p className="text-xs font-bold text-[var(--metis-red)] uppercase tracking-wider mb-1">Target Issue</p>
            <p className="font-bold text-lg text-black">{issueTitle}</p>
            <p className="text-sm text-black/70 font-mono mt-1">{repository}</p>
          </div>

          <div>
            <Label htmlFor="instructions" className="font-black text-base mb-2 block">
              Custom Instructions
            </Label>
            <div className="relative">
              <Textarea
                id="instructions"
                placeholder="e.g. 'Focus on performance', 'Use a specific library', 'Don't change the API'..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="min-h-[150px] border-2 border-black rounded-lg resize-none text-base p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] focus:shadow-[4px_4px_0px_0px_#000] transition-all"
              />
              <div className="absolute bottom-3 right-3 text-xs font-bold text-black/40 pointer-events-none">
                OPTIONAL
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="p-6 bg-[var(--metis-pastel-1)] border-t-2 border-black sm:justify-between items-center">
          <div className="text-xs font-bold text-black/60 hidden sm:block">
            * This may take a few minutes
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <AlertDialogCancel disabled={loading} className="flex-1 sm:flex-none border-2 border-black font-bold hover:bg-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLaunch}
              disabled={loading}
              className="flex-1 sm:flex-none border-2 border-black bg-[var(--metis-orange)] text-white font-bold shadow-[2px_2px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] hover:-translate-y-0.5 transition-all"
            >
              {loading ? 'Launching...' : 'Start Agent'}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
