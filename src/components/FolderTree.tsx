import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc, isAuthenticated } from "@/lib/trpc";
import type { FolderListItem } from "@/types/mdsign-app-router";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FolderTreeItemProps {
  folder: FolderListItem;
  level: number;
  collapsed: boolean;
  onDrop?: (folderId: number) => void;
}

function FolderTreeItem({ folder, level, collapsed, onDrop }: FolderTreeItemProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const hasToken = isAuthenticated();
  
  // Query subfolders only when expanded
  const subfoldersQuery = trpc.mdsign.folders.list.useQuery(
    { parentId: folder.id, includeDocumentCount: true } as any,
    { enabled: hasToken && isOpen }
  );

  const subfolders = (subfoldersQuery.data as any)?.folders || [];
  const hasChildren = subfolders.length > 0;
  
  const isActive = location.search.includes(`folder=${folder.id}`);

  const handleClick = () => {
    navigate(`/documents?folder=${folder.id}`);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const documentId = e.dataTransfer.getData("documentId");
    if (documentId && onDrop) {
      onDrop(folder.id);
    }
  };

  if (collapsed) {
    return (
      <button
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "w-full p-2 rounded-lg flex items-center justify-center transition-all",
          isActive 
            ? "bg-purple-900/70 text-white" 
            : "text-purple-100/80 hover:bg-purple-700/40",
          isDragOver && "bg-purple-500/50 ring-2 ring-purple-300"
        )}
        title={folder.name}
      >
        <Folder className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer transition-all group",
          isActive 
            ? "bg-purple-900/70 text-white" 
            : "text-purple-100/80 hover:bg-purple-700/40",
          isDragOver && "bg-purple-500/50 ring-2 ring-purple-300"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <button
          onClick={handleToggle}
          className="p-0.5 hover:bg-purple-600/50 rounded"
        >
          {isOpen ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </button>
        
        {isOpen ? (
          <FolderOpen className="w-4 h-4 flex-shrink-0" />
        ) : (
          <Folder className="w-4 h-4 flex-shrink-0" />
        )}
        
        <span className="text-sm truncate flex-1">{folder.name}</span>
        
        {folder.documentCount !== undefined && folder.documentCount > 0 && (
          <span className="text-xs text-purple-300/60 bg-purple-800/50 px-1.5 py-0.5 rounded">
            {folder.documentCount}
          </span>
        )}
      </div>

      {isOpen && hasChildren && (
        <div className="animate-fade-in">
          {subfolders.map((subfolder: FolderListItem) => (
            <FolderTreeItem
              key={subfolder.id}
              folder={subfolder}
              level={level + 1}
              collapsed={collapsed}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FolderTreeProps {
  collapsed: boolean;
  onFolderDrop?: (folderId: number, documentId: string) => void;
}

export function FolderTree({ collapsed, onFolderDrop }: FolderTreeProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const hasToken = isAuthenticated();

  const foldersQuery = trpc.mdsign.folders.list.useQuery(
    { parentId: null, includeDocumentCount: true } as any,
    { enabled: hasToken }
  );

  const folders = (foldersQuery.data as any)?.folders || [];
  const isAllDocuments = location.pathname === "/documents" && !location.search.includes("folder=");

  if (foldersQuery.isLoading) {
    return collapsed ? null : (
      <div className="px-3 py-2 text-xs text-purple-300/60">
        Carregando...
      </div>
    );
  }

  if (folders.length === 0) {
    return collapsed ? null : (
      <div className="px-3 py-2 text-xs text-purple-300/60">
        Nenhuma pasta
      </div>
    );
  }

  return (
    <div className={cn("space-y-0.5", collapsed ? "px-1" : "")}>
      {/* All Documents Link */}
      {!collapsed && (
        <button
          onClick={() => navigate("/documents")}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all",
            isAllDocuments
              ? "bg-purple-900/70 text-white"
              : "text-purple-100/80 hover:bg-purple-700/40"
          )}
        >
          <FileText className="w-4 h-4" />
          <span>Todos os Documentos</span>
        </button>
      )}
      
      <ScrollArea className={cn(collapsed ? "h-auto" : "max-h-[200px]")}>
        {folders.map((folder: FolderListItem) => (
          <FolderTreeItem
            key={folder.id}
            folder={folder}
            level={0}
            collapsed={collapsed}
            onDrop={onFolderDrop ? (folderId) => {
              // This will be handled by the parent
            } : undefined}
          />
        ))}
      </ScrollArea>
    </div>
  );
}
