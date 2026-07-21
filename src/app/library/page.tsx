"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Trash2,
  Archive,
  Copy,
  Edit3,
  FileText,
  Tag,
  Download,
  Upload,
  ArrowRight,
  Database,
  CheckSquare,
  Square,
  AlertTriangle,
  Star,
  Grid,
  List,
  AlignJustify,
  SlidersHorizontal,
  X,
  Plus,
  RefreshCw,
  FolderOpen,
  Sparkles,
  Headphones,
  Mic,
  Video,
} from "lucide-react";
import {
  listLibraryItems,
  saveLibraryItem,
  deleteLibraryItem,
  duplicateLibraryItem,
  toggleFavoriteLibraryItem,
  bulkDeleteLibraryItems,
  bulkArchiveLibraryItems,
  bulkTagLibraryItems,
  exportAllData,
  importAllData,
  clearAllData,
  getStorageUsage,
  type LibraryItem,
} from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format";

type ViewMode = "grid" | "list" | "compact";
type SortOption =
  | "modified-desc"
  | "modified-asc"
  | "created-desc"
  | "created-asc"
  | "name-asc"
  | "name-desc"
  | "word-count-desc"
  | "duration-desc"
  | "favorite-first";

export default function LibraryPage() {
  const router = useRouter();

  // Data list states
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // View & Filter states
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "document" | "draft" | "project" | "transcript" | "audio" | "archived"
  >("all");
  const [sortOption, setSortOption] = useState<SortOption>("modified-desc");

  // Selection states for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkTagInput, setBulkTagInput] = useState("");
  const [showBulkTagModal, setShowBulkTagModal] = useState(false);

  // Storage usage states
  const [storageUsed, setStorageUsed] = useState<number | null>(null);
  const [storageQuota, setStorageQuota] = useState<number | null>(null);

  // Inline Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const allItems = await listLibraryItems();
      setItems(allItems);

      const usage = await getStorageUsage();
      setStorageUsed(usage.usedBytes || (usage.storageEstimateMB || 1) * 1024 * 1024);
      setStorageQuota(usage.quotaBytes || 100 * 1024 * 1024);
    } catch (err) {
      console.error("Failed to load library data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Collect all unique tags and languages across items
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    items.forEach((item) => {
      if (item.tags) item.tags.forEach((t) => tagsSet.add(t));
    });
    return Array.from(tagsSet);
  }, [items]);

  const allLanguages = useMemo(() => {
    const langSet = new Set<string>();
    items.forEach((item) => {
      if (item.language) langSet.add(item.language);
    });
    return Array.from(langSet);
  }, [items]);

  // Filter & Sort items
  const filteredAndSortedItems = useMemo(() => {
    const result = items.filter((item) => {
      // Tab filter
      if (activeTab === "archived") {
        if (!item.archived) return false;
      } else {
        if (item.archived) return false;
        if (activeTab !== "all" && item.type !== activeTab) return false;
      }

      // Favorite filter
      if (onlyFavorites && !item.favorite) {
        return false;
      }

      // Tag filter
      if (selectedTag && (!item.tags || !item.tags.includes(selectedTag))) {
        return false;
      }

      // Language filter
      if (selectedLang && item.language !== selectedLang) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesContent = item.content.toLowerCase().includes(query);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(query));
        const matchesFileName = item.fileName?.toLowerCase().includes(query);
        return matchesTitle || matchesContent || matchesTags || matchesFileName;
      }

      return true;
    });

    // Sorting logic
    result.sort((a, b) => {
      if (sortOption === "favorite-first") {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return b.updatedAt - a.updatedAt;
      }
      if (sortOption === "modified-desc") return b.updatedAt - a.updatedAt;
      if (sortOption === "modified-asc") return a.updatedAt - b.updatedAt;
      if (sortOption === "created-desc") return b.createdAt - a.createdAt;
      if (sortOption === "created-asc") return a.createdAt - b.createdAt;
      if (sortOption === "name-asc") return a.title.localeCompare(b.title);
      if (sortOption === "name-desc") return b.title.localeCompare(a.title);
      if (sortOption === "word-count-desc") {
        const countA = a.wordCount ?? a.content.split(/\s+/).filter(Boolean).length;
        const countB = b.wordCount ?? b.content.split(/\s+/).filter(Boolean).length;
        return countB - countA;
      }
      if (sortOption === "duration-desc") {
        return (b.estimatedDurationMs ?? 0) - (a.estimatedDurationMs ?? 0);
      }
      return 0;
    });

    return result;
  }, [items, activeTab, onlyFavorites, selectedTag, selectedLang, searchQuery, sortOption]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedTag !== null ||
    selectedLang !== null ||
    onlyFavorites ||
    activeTab !== "all";

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedTag(null);
    setSelectedLang(null);
    setOnlyFavorites(false);
    setActiveTab("all");
  };

  // Selection Helpers
  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedItems.map((x) => x.id)));
    }
  };

  // Actions
  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavoriteLibraryItem(id);
    await loadData();
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await duplicateLibraryItem(id);
    setNotice("Item duplicated successfully.");
    await loadData();
  };

  const handleDeleteSingle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      await deleteLibraryItem(id);
      setNotice("Item deleted.");
      await loadData();
    }
  };

  const handleToggleArchiveSingle = async (item: LibraryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    await saveLibraryItem({ ...item, archived: !item.archived, updatedAt: Date.now() });
    setNotice(item.archived ? "Item unarchived." : "Item moved to archive.");
    await loadData();
  };

  const handleStartRename = (item: LibraryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditTitle(item.title);
  };

  const handleSaveRename = async (item: LibraryItem, e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    await saveLibraryItem({ ...item, title: editTitle.trim(), updatedAt: Date.now() });
    setEditingId(null);
    setNotice("Title updated.");
    await loadData();
  };

  // Bulk Handlers
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedIds.size} selected item(s)? This action cannot be undone.`
      )
    ) {
      await bulkDeleteLibraryItems(Array.from(selectedIds));
      setSelectedIds(new Set());
      setNotice("Selected items deleted.");
      await loadData();
    }
  };

  const handleBulkArchive = async (archived: boolean) => {
    if (selectedIds.size === 0) return;
    await bulkArchiveLibraryItems(Array.from(selectedIds), archived);
    setSelectedIds(new Set());
    setNotice(archived ? "Selected items archived." : "Selected items restored.");
    await loadData();
  };

  const handleBulkTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkTagInput.trim() || selectedIds.size === 0) return;
    const tags = bulkTagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    for (const tag of tags) {
      await bulkTagLibraryItems(Array.from(selectedIds), tag);
    }
    setShowBulkTagModal(false);
    setBulkTagInput("");
    setSelectedIds(new Set());
    setNotice("Tags applied to selected items.");
    await loadData();
  };

  // Navigation
  const handleOpenItem = (item: LibraryItem) => {
    if (item.type === "document") {
      router.push(`/reader?id=${item.id}`);
    } else if (item.type === "project") {
      router.push(`/studio?id=${item.id}`);
    } else if (item.type === "transcript") {
      router.push(`/transcribe?id=${item.id}`);
    } else {
      router.push(`/reader?id=${item.id}`);
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case "document":
        return <BookOpen className="size-4 text-primary" />;
      case "project":
        return <Sparkles className="size-4 text-accent" />;
      case "transcript":
        return <Mic className="size-4 text-emerald-500" />;
      case "audio":
        return <Headphones className="size-4 text-indigo-500" />;
      default:
        return <FileText className="size-4 text-text-muted" />;
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      {/* Header & Storage Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Database className="size-6 text-primary" />
            <h1 className="text-2xl font-bold sm:text-3xl">Local Library</h1>
          </div>
          <p className="text-text-muted text-xs sm:text-sm mt-1">
            Privacy-first IndexedDB storage for your drafts, documents, transcripts, and voice studio projects.
          </p>
        </div>

        {/* Backup & Export / Import */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              const data = await exportAllData();
              const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `mk-voicekit-backup-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="cursor-pointer"
            title="Download full JSON backup of your library, presets, and history"
          >
            <Download className="size-4 mr-1.5" />
            <span>Export Backup</span>
          </Button>

          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-semibold text-text hover:bg-surface-sunken shadow-sm transition-all cursor-pointer">
            <Upload className="size-4 text-primary" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const text = await file.text();
                  const json = JSON.parse(text);
                  const count = await importAllData(json);
                  setNotice(`Imported ${count} history items & library records successfully.`);
                  await loadData();
                } catch {
                  setNotice("Failed to import JSON backup file.");
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm text-primary animate-fade-in">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="p-1 hover:opacity-80 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Storage Gauge & Status */}
      {storageUsed !== null && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4 text-xs text-text-muted shadow-sm">
          <div className="flex items-center gap-2">
            <Database className="size-4 text-primary" />
            <span>
              Device Storage: <strong>{(storageUsed / 1024 / 1024).toFixed(2)} MB</strong>
              {storageQuota ? ` of ${(storageQuota / 1024 / 1024 / 1024).toFixed(1)} GB available` : " in use"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>{items.length} total saved items</span>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-danger hover:underline cursor-pointer font-medium"
            >
              Clear all storage
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Main Tabs */}
          <div className="flex flex-wrap gap-1 border-b border-border pb-1 sm:pb-0">
            {(
              [
                { key: "all", label: "All Items" },
                { key: "document", label: "Documents" },
                { key: "draft", label: "Drafts" },
                { key: "project", label: "Studio Projects" },
                { key: "transcript", label: "Transcripts" },
                { key: "archived", label: "Archive" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  activeTab === tab.key
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-text-muted hover:text-text hover:bg-surface-sunken"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Toggles & Sort Menu */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text focus:outline-none focus:border-primary"
            >
              <option value="modified-desc">Recently Modified</option>
              <option value="created-desc">Recently Created</option>
              <option value="created-asc">Oldest First</option>
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
              <option value="word-count-desc">Word Count</option>
              <option value="duration-desc">Duration</option>
              <option value="favorite-first">Favorites First</option>
            </select>

            <div className="flex rounded-lg border border-border bg-surface p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded text-text cursor-pointer",
                  viewMode === "grid" ? "bg-primary text-on-primary" : "hover:bg-surface-sunken"
                )}
                title="Grid View"
              >
                <Grid size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded text-text cursor-pointer",
                  viewMode === "list" ? "bg-primary text-on-primary" : "hover:bg-surface-sunken"
                )}
                title="List View"
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setViewMode("compact")}
                className={cn(
                  "p-1.5 rounded text-text cursor-pointer",
                  viewMode === "compact" ? "bg-primary text-on-primary" : "hover:bg-surface-sunken"
                )}
                title="Compact View"
              >
                <AlignJustify size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Tag Filter Row */}
        <div className="flex flex-wrap items-center gap-3 bg-surface border border-border p-3 rounded-xl shadow-sm">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 size-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search library by title, content, or tags…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-sunken pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-text-muted hover:text-text cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer",
              onlyFavorites
                ? "bg-amber-500/15 border-amber-500 text-amber-500"
                : "border-border text-text-muted hover:text-text hover:bg-surface-sunken"
            )}
          >
            <Star size={13} className={onlyFavorites ? "fill-amber-500" : ""} />
            <span>Favorites</span>
          </button>

          {allTags.length > 0 && (
            <select
              value={selectedTag || ""}
              onChange={(e) => setSelectedTag(e.target.value ? e.target.value : null)}
              className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text focus:outline-none"
            >
              <option value="">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  Tag: #{tag}
                </option>
              ))}
            </select>
          )}

          {allLanguages.length > 0 && (
            <select
              value={selectedLang || ""}
              onChange={(e) => setSelectedLang(e.target.value ? e.target.value : null)}
              className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text focus:outline-none"
            >
              <option value="">All Languages</option>
              {allLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  Lang: {lang}
                </option>
              ))}
            </select>
          )}

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-primary hover:underline cursor-pointer font-medium ml-auto"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Toolbar when items are selected */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-primary/10 border border-primary/30 p-3 rounded-xl animate-fade-in text-xs">
          <div className="flex items-center gap-3 font-semibold text-primary">
            <button onClick={handleSelectAll} className="flex items-center gap-1.5 cursor-pointer">
              <CheckSquare size={16} />
              <span>
                {selectedIds.size} of {filteredAndSortedItems.length} selected
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowBulkTagModal(true)}
              className="text-xs py-1 h-7"
            >
              <Tag size={12} className="mr-1" /> Add Tags
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkArchive(activeTab !== "archived")}
              className="text-xs py-1 h-7"
            >
              <Archive size={12} className="mr-1" />
              {activeTab === "archived" ? "Restore" : "Archive"}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              className="text-xs py-1 h-7"
            >
              <Trash2 size={12} className="mr-1" /> Delete Selected
            </Button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="p-1 text-text-muted hover:text-text cursor-pointer ml-1"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Bulk Tag Modal */}
      {showBulkTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-surface border border-border rounded-xl p-5 shadow-2xl space-y-4 animate-fade-in">
            <h3 className="font-bold text-base">Add Tags to Selected Items</h3>
            <p className="text-xs text-text-muted">
              Enter comma-separated tags to assign to the {selectedIds.size} selected item(s).
            </p>
            <form onSubmit={handleBulkTagSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="e.g. study, research, podcast"
                value={bulkTagInput}
                onChange={(e) => setBulkTagInput(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-sunken p-2 text-sm focus:outline-none focus:border-primary"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowBulkTagModal(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit">
                  Apply Tags
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Items Container */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 py-12">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 rounded-xl border border-border bg-surface-sunken animate-pulse p-4"
            />
          ))}
        </div>
      ) : filteredAndSortedItems.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center space-y-4">
          <FolderOpen className="size-12 mx-auto text-text-muted opacity-50" />
          <h3 className="font-bold text-lg">No Library Items Found</h3>
          <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto">
            {hasActiveFilters
              ? "No items match your active filters or search query."
              : "Your saved library is currently empty. You can import documents or create drafts from any workspace."}
          </p>
          {hasActiveFilters ? (
            <Button variant="secondary" size="sm" onClick={handleClearFilters}>
              Reset Filters
            </Button>
          ) : (
            <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary">
              <Plus size={14} /> Create New Draft
            </Link>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedItems.map((item) => {
            const isSelected = selectedIds.has(item.id);
            const isEditing = editingId === item.id;
            const wordCount = item.wordCount ?? item.content.split(/\s+/).filter(Boolean).length;

            return (
              <div
                key={item.id}
                onClick={() => handleOpenItem(item)}
                className={cn(
                  "group relative flex flex-col justify-between rounded-xl border bg-surface p-5 shadow-sm hover:border-primary/60 hover:shadow-md transition-all cursor-pointer",
                  isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                )}
              >
                <div>
                  {/* Top card bar: Checkbox, Type Badge, Star */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleToggleSelect(item.id, e)}
                        className="text-text-muted hover:text-primary cursor-pointer p-0.5"
                      >
                        {isSelected ? (
                          <CheckSquare size={16} className="text-primary" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                      <span className="inline-flex items-center gap-1 rounded-md bg-surface-sunken px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        {getItemTypeIcon(item.type)}
                        <span>{item.type}</span>
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleToggleFavorite(item.id, e)}
                      className={cn(
                        "p-1 rounded hover:bg-surface-sunken transition-colors cursor-pointer",
                        item.favorite ? "text-amber-500" : "text-text-muted opacity-40 group-hover:opacity-100"
                      )}
                      title={item.favorite ? "Favorited" : "Add to favorites"}
                    >
                      <Star size={15} className={item.favorite ? "fill-amber-500" : ""} />
                    </button>
                  </div>

                  {/* Title */}
                  {isEditing ? (
                    <form onSubmit={(e) => handleSaveRename(item, e)} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded border border-primary bg-surface p-1 text-sm font-bold focus:outline-none"
                        autoFocus
                        onBlur={() => setEditingId(null)}
                      />
                    </form>
                  ) : (
                    <h3 className="font-bold text-base text-text line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  )}

                  {/* Content snippet */}
                  <p className="mt-2 text-xs text-text-muted line-clamp-3 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                {/* Footer: Tags, Metrics, Actions */}
                <div className="mt-4 pt-3 border-t border-border/60 space-y-2">
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary font-medium">
                          #{tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-[10px] text-text-muted">+{item.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-text-muted">
                    <span>{wordCount} words</span>
                    <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                  </div>

                  {/* Hover Actions */}
                  <div
                    className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => handleStartRename(item, e)}
                      className="p-1 text-text-muted hover:text-text rounded hover:bg-surface-sunken"
                      title="Rename"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={(e) => handleDuplicate(item.id, e)}
                      className="p-1 text-text-muted hover:text-text rounded hover:bg-surface-sunken"
                      title="Duplicate"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={(e) => handleToggleArchiveSingle(item, e)}
                      className="p-1 text-text-muted hover:text-text rounded hover:bg-surface-sunken"
                      title={item.archived ? "Unarchive" : "Archive"}
                    >
                      <Archive size={13} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteSingle(item.id, e)}
                      className="p-1 text-danger/80 hover:text-danger rounded hover:bg-danger/10"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === "list" ? (
        /* LIST VIEW */
        <div className="space-y-3">
          {filteredAndSortedItems.map((item) => {
            const isSelected = selectedIds.has(item.id);
            const wordCount = item.wordCount ?? item.content.split(/\s+/).filter(Boolean).length;

            return (
              <div
                key={item.id}
                onClick={() => handleOpenItem(item)}
                className={cn(
                  "group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-surface p-4 shadow-sm hover:border-primary/60 transition-all cursor-pointer",
                  isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                )}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={(e) => handleToggleSelect(item.id, e)}
                    className="text-text-muted hover:text-primary cursor-pointer mt-1"
                  >
                    {isSelected ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                  </button>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded bg-surface-sunken px-1.5 py-0.5 text-[10px] font-bold uppercase text-text-muted">
                        {getItemTypeIcon(item.type)} {item.type}
                      </span>
                      <h3 className="font-bold text-sm text-text truncate group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      {item.favorite && <Star size={13} className="text-amber-500 fill-amber-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-text-muted truncate">{item.content}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 text-xs text-text-muted border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="text-right">
                    <p className="font-medium text-text">{wordCount} words</p>
                    <p className="text-[10px]">{new Date(item.updatedAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleToggleFavorite(item.id, e)}
                      className="p-1.5 text-text-muted hover:text-amber-500 rounded hover:bg-surface-sunken"
                    >
                      <Star size={14} className={item.favorite ? "fill-amber-500 text-amber-500" : ""} />
                    </button>
                    <button
                      onClick={(e) => handleDuplicate(item.id, e)}
                      className="p-1.5 text-text-muted hover:text-text rounded hover:bg-surface-sunken"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteSingle(item.id, e)}
                      className="p-1.5 text-danger/80 hover:text-danger rounded hover:bg-danger/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* COMPACT TABLE VIEW */
        <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-surface-sunken text-text-muted font-bold">
              <tr>
                <th className="p-3 w-10">
                  <button onClick={handleSelectAll} className="cursor-pointer">
                    {selectedIds.size > 0 && selectedIds.size === filteredAndSortedItems.length ? (
                      <CheckSquare size={15} className="text-primary" />
                    ) : (
                      <Square size={15} />
                    )}
                  </button>
                </th>
                <th className="p-3">Title</th>
                <th className="p-3">Type</th>
                <th className="p-3">Words</th>
                <th className="p-3">Updated</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAndSortedItems.map((item) => {
                const isSelected = selectedIds.has(item.id);
                const wordCount = item.wordCount ?? item.content.split(/\s+/).filter(Boolean).length;

                return (
                  <tr
                    key={item.id}
                    onClick={() => handleOpenItem(item)}
                    className={cn(
                      "hover:bg-surface-sunken transition-colors cursor-pointer",
                      isSelected && "bg-primary/5"
                    )}
                  >
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <button onClick={(e) => handleToggleSelect(item.id, e)} className="cursor-pointer">
                        {isSelected ? <CheckSquare size={15} className="text-primary" /> : <Square size={15} />}
                      </button>
                    </td>
                    <td className="p-3 font-semibold text-text max-w-xs truncate">
                      <span className="flex items-center gap-1.5">
                        {item.favorite && <Star size={12} className="text-amber-500 fill-amber-500 shrink-0" />}
                        {item.title}
                      </span>
                    </td>
                    <td className="p-3 uppercase text-[10px] font-bold text-text-muted">{item.type}</td>
                    <td className="p-3 text-text-muted">{wordCount}</td>
                    <td className="p-3 text-text-muted">{new Date(item.updatedAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => handleToggleFavorite(item.id, e)}
                          className="p-1 text-text-muted hover:text-amber-500"
                        >
                          <Star size={13} className={item.favorite ? "fill-amber-500 text-amber-500" : ""} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteSingle(item.id, e)}
                          className="p-1 text-danger/80 hover:text-danger"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-danger/40 bg-surface p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 text-danger">
              <AlertTriangle className="size-6" />
              <h3 className="text-lg font-bold">Clear All Local Data?</h3>
            </div>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              This will permanently delete all saved drafts, imported documents, projects, listening history, and custom presets from this browser’s IndexedDB storage.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setShowClearConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  await clearAllData();
                  setShowClearConfirm(false);
                  setNotice("All local data cleared.");
                  await loadData();
                }}
              >
                Confirm Delete All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
