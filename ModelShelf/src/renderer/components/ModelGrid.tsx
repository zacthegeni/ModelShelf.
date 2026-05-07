import React, { useState } from 'react'
import { File, Box } from 'lucide-react'
import { ModelFile } from '../../main/watcher'
import StlViewer from './StlViewer'

interface ModelGridProps {
  models: ModelFile[]
  selectedModel: ModelFile | null
  onSelectModel: (model: ModelFile) => void
}

export default function ModelGrid({ models, selectedModel, onSelectModel }: ModelGridProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {models.map(model => (
          <ModelCard
            key={model.path}
            model={model}
            isSelected={selectedModel?.path === model.path}
            onClick={() => onSelectModel(model)}
          />
        ))}
      </div>
    </div>
  )
}

function ModelCard({ model, isSelected, onClick }: { model: ModelFile, isSelected: boolean, onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false)
  const isStl = model.extension === '.stl'

  const displayName = model.metadata?.title || model.name

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-lg border overflow-hidden cursor-pointer transition-all duration-200 bg-[#222] flex flex-col h-64
        ${isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-800 hover:border-gray-600'}`}
    >
      <div className="h-40 bg-[#1e1e1e] relative flex items-center justify-center overflow-hidden">
        {isStl ? (
          <StlViewer url={model.path} isHovered={isHovered} isThumbnail={true} />
        ) : (
          <Box size={48} className="text-gray-600" />
        )}
        <div className="absolute top-2 right-2 bg-black/60 text-xs px-1.5 py-0.5 rounded text-gray-300 font-medium">
          {model.extension.toUpperCase().replace('.', '')}
        </div>
        {model.versions.length > 0 && (
          <div className="absolute top-2 left-2 bg-blue-600/80 text-xs px-1.5 py-0.5 rounded text-white font-medium shadow">
            +{model.versions.length} versions
          </div>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between">
        <h3 className="text-sm font-medium text-gray-200 truncate" title={displayName}>
          {displayName}
        </h3>

        <div className="mt-2 flex gap-1 flex-wrap overflow-hidden h-5">
          {model.metadata?.tags?.split(',').map((tag: string, i: number) => (
            tag.trim() && (
              <span key={i} className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700">
                {tag.trim()}
              </span>
            )
          ))}
        </div>
      </div>
    </div>
  )
}
