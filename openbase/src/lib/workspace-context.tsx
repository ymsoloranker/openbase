"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface Workspace {
  id: string;
  name: string;
  icon: string | null;
}

interface WorkspaceContextType {
  workspace: Workspace | null;
  isLoading: boolean;
  setWorkspace: (workspace: Workspace) => void;
  refreshWorkspace: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspaceState] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWorkspace();
  }, []);

  async function fetchWorkspace() {
    try {
      const res = await fetch("/api/workspace");
      if (res.ok) {
        const data = await res.json();
        if (data.workspace) {
          setWorkspaceState(data.workspace);
        }
      }
    } catch (error) {
      console.error("Failed to fetch workspace:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function setWorkspace(workspace: Workspace) {
    setWorkspaceState(workspace);
  }

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        isLoading,
        setWorkspace,
        refreshWorkspace: fetchWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
