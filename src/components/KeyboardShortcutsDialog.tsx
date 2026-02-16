import { Keyboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';

const shortcuts = [
  {
    category: 'Navigation',
    items: [
      { keys: ['↑', '↓', '←', '→'], description: 'Move between cells' },
      { keys: ['Enter'], description: 'Edit cell / Move down after edit' },
      { keys: ['Tab'], description: 'Move right after edit' },
      { keys: ['Shift', 'Tab'], description: 'Move left after edit' },
      { keys: ['Esc'], description: 'Cancel edit' },
    ]
  },
  {
    category: 'Editing',
    items: [
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Y'], description: 'Redo' },
      { keys: ['Ctrl', 'C'], description: 'Copy cell' },
      { keys: ['Ctrl', 'X'], description: 'Cut cell' },
      { keys: ['Ctrl', 'V'], description: 'Paste' },
      { keys: ['Del'], description: 'Delete cell content' },
    ]
  },
  {
    category: 'Formatting',
    items: [
      { keys: ['Ctrl', 'B'], description: 'Bold' },
      { keys: ['Ctrl', 'I'], description: 'Italic' },
      { keys: ['Ctrl', 'U'], description: 'Underline' },
    ]
  },
  {
    category: 'File',
    items: [
      { keys: ['Ctrl', 'S'], description: 'Save as .kst file' },
    ]
  },
];

function KeyboardShortcutsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-3 text-xs">
          <Keyboard className="h-3 w-3 mr-1" />
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Master Keste with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="font-semibold text-sm mb-3 text-primary">{section.category}</h3>
              <div className="space-y-2">
                {section.items.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-sm text-muted-foreground">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <span key={keyIdx} className="flex items-center">
                          <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded shadow-sm">
                            {key}
                          </kbd>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className="mx-1 text-xs text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> Right-click on any cell to access quick actions!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default KeyboardShortcutsDialog;
