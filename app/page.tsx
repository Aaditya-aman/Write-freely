"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHistory } from "@/lib/db";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTheme } from "next-themes";

const fonts = [
  { name: "Inter", class: "font-sans" },
  { name: "Georgia", class: "font-serif" },
  { name: "Menlo", class: "font-mono" },
  { name: "Helvetica", class: "font-helvetica" },
  { name: "Garamond", class: "font-garamond" },
];

const themes = [
  { name: "Light", value: "light" },
  { name: "Dark", value: "dark" },
  { name: "Sepia", value: "sepia" },
];

const INITIAL_TIME = 15 * 60;
const DEFAULT_FONT_SIZE = 18;

const placeholders = [
  "Start writing...",
  "Share your thoughts...",
  "Just say it...",
  "What's on your mind?",
  "Type your first thought...",
  "Begin your journey here...",
  "Let the words flow...",
  "Write freely...",
  "Capture your ideas...",
  "Express yourself..."
];

export default function Home() {
  const [text, setText] = useState("");
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedFont, setSelectedFont] = useState(fonts[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [clearHistoryDialogOpen, setClearHistoryDialogOpen] = useState(false);
  const [newSessionDialogOpen, setNewSessionDialogOpen] = useState(false);
  const [deleteEntryDialogOpen, setDeleteEntryDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [placeholder, setPlaceholder] = useState("");
  const { history, isLoading, addEntry, deleteEntry, clearHistory } = useHistory();
  const { theme, setTheme } = useTheme();

  // Get a random placeholder on initial load
  useEffect(() => {
    setPlaceholder(placeholders[Math.floor(Math.random() * placeholders.length)]);
  }, []);

  const toggleTimer = useCallback(() => {
    setIsTimerRunning(!isTimerRunning);
  }, [isTimerRunning]);

  const resetTimer = useCallback(() => {
    setIsTimerRunning(false);
    setTimeLeft(INITIAL_TIME);
  }, []);

  const saveCurrentText = useCallback(() => {
    if (text.trim()) {
      addEntry({
        text,
        timestamp: Date.now(),
      });
      toast.success("Text saved to history", { duration: 2000 });
    } else {
      toast.error("Cannot save empty text", { duration: 2000 });
    }
  }, [text, addEntry]);

  const startNewSession = useCallback(() => {
    if (text.trim()) {
      setNewSessionDialogOpen(true);
    } else {
      setText("");
      resetTimer();
      toast.info("Started new writing session", { duration: 2000 });
    }
  }, [text, resetTimer, setText]);

  const confirmNewSession = useCallback(() => {
    setText("");
    resetTimer();
    setNewSessionDialogOpen(false);
    toast.info("Started new writing session", { duration: 2000 });
  }, [resetTimer, setText, setNewSessionDialogOpen]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  const randomFont = useCallback(() => {
    const newFont = fonts[Math.floor(Math.random() * fonts.length)];
    setSelectedFont(newFont);
  }, []);

  const loadHistoryEntry = useCallback((entry: { text: string; timestamp: number }) => {
    setText(entry.text);
    setIsHistoryOpen(false);
  }, []);

  const formatDate = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  }, []);

  const increaseFontSize = useCallback(() => {
    setFontSize(prev => Math.min(prev + 2, 32));
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSize(prev => Math.max(prev - 2, 12));
  }, []);

  const resetFontSize = useCallback(() => {
    setFontSize(DEFAULT_FONT_SIZE);
  }, []);

  const handleDeleteEntry = useCallback((timestamp: number) => {
    setEntryToDelete(timestamp);
    setDeleteEntryDialogOpen(true);
  }, []);

  const confirmDeleteEntry = useCallback(() => {
    if (entryToDelete) {
      deleteEntry(entryToDelete);
      toast.success("Entry deleted", { duration: 2000 });
      setDeleteEntryDialogOpen(false);
      setEntryToDelete(null);
    }
  }, [entryToDelete, deleteEntry]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  useEffect(() => {
    // Save text to history when timer ends
    if (timeLeft === 0 && text.trim()) {
      addEntry({
        text,
        timestamp: Date.now(),
      });
    }
  }, [timeLeft, text, addEntry]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N: New session
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        startNewSession();
      }
      // Ctrl+S: Save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveCurrentText();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveCurrentText, startNewSession]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 container mx-auto py-4 sm:py-8 px-2 sm:px-4">
        <textarea
          className={`w-full h-[calc(100vh-8rem)] bg-background resize-none p-2 sm:p-4 focus:outline-none ${selectedFont.class}`}
          style={{ fontSize: `${fontSize}px` }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
        />
      </main>

      <div className={`fixed right-0 top-0 h-full w-full sm:w-80 bg-card border-l transform transition-transform duration-300 ease-in-out ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'} z-30`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Writing History</h2>
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  onClick={() => setClearHistoryDialogOpen(true)}
                  className="text-muted-foreground hover:text-destructive text-sm"
                  title="Clear all history"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4">
            {isLoading ? (
              <p className="text-muted-foreground text-center py-4">
                Loading history...
              </p>
            ) : history.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No history yet. Complete a timer session to save your writing.
              </p>
            ) : (
              history.map((entry) => (
                <div
                  key={entry.timestamp}
                  className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer group relative"
                >
                  <div 
                    className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEntry(entry.timestamp);
                    }}
                  >
                    <span className="text-sm text-muted-foreground hover:text-destructive">
                      Delete
                    </span>
                  </div>
                  <div 
                    className="flex justify-between items-center mb-2"
                    onClick={() => loadHistoryEntry(entry)}
                  >
                    <span className="text-sm text-muted-foreground">
                      {formatDate(entry.timestamp)}
                    </span>
                  </div>
                  <p 
                    className="line-clamp-3 text-sm"
                    onClick={() => loadHistoryEntry(entry)}
                  >
                    {entry.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={clearHistoryDialogOpen} onOpenChange={setClearHistoryDialogOpen}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your saved writing history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const success = await clearHistory();
                if (success) {
                  toast.success("History cleared", { duration: 2000 });
                } else {
                  toast.error("Failed to clear history", { duration: 2000 });
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={newSessionDialogOpen} onOpenChange={setNewSessionDialogOpen}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Start a new session?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current text will be lost if not saved. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmNewSession}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Start New Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteEntryDialogOpen} onOpenChange={setDeleteEntryDialogOpen}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this writing entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setEntryToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEntry}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <footer className="fixed bottom-0 sm:bottom-2 left-0 right-0 bg-card/80 backdrop-blur-sm border-t sm:rounded-lg sm:mx-4 z-20">
        <nav className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-wrap justify-between gap-y-2 text-xs sm:text-sm">
            <div className="flex gap-x-2 sm:gap-x-4 items-center overflow-x-auto scrollbar-hide pb-1">
              <DropdownMenu>
                <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                  {selectedFont.name}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {fonts.map((font) => (
                    <DropdownMenuItem
                      key={font.name}
                      onClick={() => setSelectedFont(font)}
                    >
                      <span className={font.class}>{font.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="h-5 border-l border-border mx-1 hidden sm:block"></div>

              <div className="flex items-center gap-x-1 sm:gap-x-2">
                <button
                  onClick={decreaseFontSize}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Decrease text size"
                >
                  A-
                </button>
                <span className="text-muted-foreground text-xs sm:text-sm">{fontSize}px</span>
                <button
                  onClick={increaseFontSize}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Increase text size"
                >
                  A+
                </button>
                <button
                  onClick={resetFontSize}
                  className="text-muted-foreground hover:text-foreground transition-colors ml-1 hidden xs:inline-block"
                  title="Reset text size"
                >
                  Reset
                </button>
              </div>

              <div className="h-5 border-l border-border mx-1 hidden sm:block"></div>

              <DropdownMenu>
                <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                  Theme
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {themes.map((t) => (
                    <DropdownMenuItem
                      key={t.value}
                      onClick={() => setTheme(t.value)}
                    >
                      {t.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                onClick={randomFont}
                className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap hidden sm:block"
              >
                Random Font
              </button>
            </div>

            <div className="flex gap-x-2 sm:gap-x-4 items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={startNewSession}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      New Chat
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>New session (Ctrl+N)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <button
                onClick={toggleFullscreen}
                className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
              >
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={saveCurrentText}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Save
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save (Ctrl+S)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <button
                onClick={resetTimer}
                className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
              >
                Reset
              </button>
              <button
                onClick={toggleTimer}
                className={`transition-colors whitespace-nowrap ${
                  !isTimerRunning && timeLeft === 0
                    ? "text-destructive hover:text-destructive/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {formatTime(timeLeft)} {isTimerRunning ? "(Stop)" : "(Start)"}
              </button>
              <button
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {isHistoryOpen ? "History" : "History"}
              </button>
            </div>
          </div>
        </nav>
      </footer>

      <style jsx global>{`
        @media (max-width: 640px) {
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        }
        
        @media (min-width: 480px) {
          .xs\\:inline-block {
            display: inline-block;
          }
        }
      `}</style>
    </div>
  );
}