/**
 * Floating save bar for unsaved changes.
 *
 * Appears at bottom center when there are unsaved changes.
 * Neo-brutalist design with compact, wide layout.
 */

import { Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UnsavedChangesBarProps {
  onSave: () => void;
  onRevert: () => void;
  saving?: boolean;
}

export function UnsavedChangesBar({ onSave, onRevert, saving = false }: UnsavedChangesBarProps) {
  return (
    <div className="animate-in slide-in-from-bottom-5 fade-in fixed bottom-6 left-1/2 z-50 -translate-x-1/2 duration-200">
      <div className="flex w-[min(92vw,760px)] items-center justify-between gap-4 rounded border-2 border-black bg-[var(--metis-pastel-2)] px-6 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:px-8">
        {/* Indicator */}
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--metis-red)]" />
          <span className="text-sm font-bold text-[var(--metis-black)]">Unsaved changes</span>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-[var(--metis-black)]" />

        {/* Actions */}
        <div className="ml-auto flex gap-2">
          <Button
            variant="neutral"
            size="sm"
            onClick={onRevert}
            disabled={saving}
            className="h-8 border-2 border-black bg-[var(--metis-white)] px-6 text-xs font-bold text-[var(--metis-black)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:bg-[var(--metis-pastel-1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Revert
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={saving}
            className="h-8 border-2 border-black bg-[var(--metis-orange)] px-4 text-xs font-bold text-[var(--metis-white)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:bg-[var(--metis-orange-dark)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            <Save className="mr-1 h-3 w-3" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
