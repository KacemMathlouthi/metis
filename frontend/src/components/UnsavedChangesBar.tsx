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
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className="flex items-center gap-6 rounded border-2 border-black bg-white px-12 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] backdrop-blur-lg">
        {/* Indicator */}
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
          <span className="text-sm font-bold">Unsaved changes</span>
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-black" />

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="neutral"
            size="sm"
            onClick={onRevert}
            disabled={saving}
            className="h-7 border-2 border-black px-6 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Revert
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={saving}
            className="h-7 border-2 border-black bg-[#4ADE80] px-3 text-xs font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            <Save className="mr-1 h-3 w-3" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
