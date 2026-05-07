import React, { useState, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'
import { FolderOpen, Search, Settings } from 'lucide-react'
import ModelGrid from './components/ModelGrid'
import DetailsPanel from './components/DetailsPanel'
import { ModelFile } from '../main/watcher'

function App() {
  const [models, setModels] = useState<ModelFile[]>([])
  const [folder, setFolder] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModel, setSelectedModel] = useState<ModelFile | null>(null)

  useEffect(() => {
    window.api.getInitialFolder().then(f => {
      if (f) setFolder(f)
    })

    window.api.onModelsChanged((newModels: ModelFile[]) => {
      setModels(newModels)

      // Update selected model if it changed
      setSelectedModel(current => {
        if (!current) return null
        return newModels.find(m => m.path === current.path) || null
      })
    })
  }, [])

  const handleOpenFolder = async () => {
    const newFolder = await window.api.openDirectory()
    if (newFolder) {
      setFolder(newFolder)
    }
  }

  const filteredModels = useMemo(() => {
    if (!searchQuery) {
      // Group logic: only show base files or ones with no version
      const seenGroups = new Set()
      return models.filter(m => {
        if (m.versions.length > 0) {
          // Identify a base. Simple check: if its name has fewer characters or no v suffix
          const baseName = m.name.replace(/[-_]?v\d+.*$/i, '')
          if (seenGroups.has(baseName)) return false
          seenGroups.add(baseName)
          return true
        }
        return true
      })
    }

    const fuse = new Fuse(models, {
      keys: ['name', 'metadata.tags', 'metadata.description', 'metadata.keywords', 'metadata.notes'],
      threshold: 0.3
    })
    return fuse.search(searchQuery).map(result => result.item)
  }, [models, searchQuery])

  return (
    <div className="flex h-screen w-screen bg-[#121212] text-gray-200">
      {/* Sidebar */}
      <div className="w-64 bg-[#1a1a1a] border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold tracking-tight text-white mb-4">ModelShelf</h1>
          <button
            onClick={handleOpenFolder}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
          >
            <FolderOpen size={16} />
            {folder ? 'Change Folder' : 'Choose Folder'}
          </button>
        </div>

        {folder && (
          <div className="p-4 flex-1">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#2a2a2a] border border-gray-700 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
              />
            </div>

            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Library Info
            </div>
            <div className="text-sm text-gray-400">
              {models.length} items found
            </div>
          </div>
        )}

        <div className="p-4 border-t border-gray-800 text-xs text-gray-500 truncate" title={folder || 'No folder selected'}>
          {folder || 'No folder selected'}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {!folder ? (
          <div className="flex-1 flex items-center justify-center flex-col text-gray-500">
            <FolderOpen size={48} className="mb-4 opacity-50" />
            <p className="text-lg">Select a folder to start organizing</p>
          </div>
        ) : models.length === 0 ? (
          <div className="flex-1 flex items-center justify-center flex-col text-gray-500">
            <p className="text-lg">No 3D models found in this folder</p>
            <p className="text-sm mt-2 opacity-75">Supported: STL, 3MF, OBJ, STEP, F3D, etc.</p>
          </div>
        ) : (
          <ModelGrid
            models={filteredModels}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
          />
        )}
      </div>

      {/* Details Panel */}
      {selectedModel && (
        <DetailsPanel
          model={selectedModel}
          allModels={models}
          onClose={() => setSelectedModel(null)}
          onUpdateMetadata={async (data) => {
            await window.api.updateMetadata(selectedModel.path, data)
            // Local state update is handled by the models-changed event from main
          }}
        />
      )}
    </div>
  )
}

export default App
