import React, { useState, useEffect } from 'react'
import { X, FolderOpen, ExternalLink, Printer, Edit, Save } from 'lucide-react'
import { ModelFile } from '../../main/watcher'
import StlViewer from './StlViewer'

interface DetailsPanelProps {
  model: ModelFile
  allModels: ModelFile[]
  onClose: () => void
  onUpdateMetadata: (data: any) => void
}

export default function DetailsPanel({ model, allModels, onClose, onUpdateMetadata }: DetailsPanelProps) {
  const isStl = model.extension === '.stl'
  const isFusionCapable = ['.f3d', '.f3z'].includes(model.extension)

  // Find linked fusion file
  const linkedFusionFile = model.relatedFiles.find(f => f.endsWith('.f3d') || f.endsWith('.f3z'))

  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    title: model.metadata?.title || '',
    description: model.metadata?.description || '',
    tags: model.metadata?.tags || '',
    notes: model.metadata?.notes || ''
  })

  // Sync form data when model changes
  useEffect(() => {
    setFormData({
      title: model.metadata?.title || '',
      description: model.metadata?.description || '',
      tags: model.metadata?.tags || '',
      notes: model.metadata?.notes || ''
    })
    setEditMode(false)
  }, [model.path])

  const handleSave = () => {
    onUpdateMetadata(formData)
    setEditMode(false)
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleOpenPath = () => window.api.openPath(model.path)
  const handleShowInFolder = () => window.api.showItemInFolder(model.path)
  const handleOpenFusion = () => {
    if (linkedFusionFile) window.api.openPath(linkedFusionFile)
  }

  return (
    <div className="w-96 bg-[#1e1e1e] border-l border-gray-800 flex flex-col h-full overflow-hidden shadow-2xl z-10">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h2 className="font-medium text-white truncate pr-4">Details</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Preview Area */}
        <div className="h-64 bg-black relative border-b border-gray-800">
          {isStl ? (
            <StlViewer url={model.path} isHovered={true} isThumbnail={false} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              No 3D Preview
            </div>
          )}
        </div>

        <div className="p-4 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleOpenPath}
              className="flex items-center justify-center gap-2 bg-[#2a2a2a] hover:bg-[#333] text-gray-200 p-2 rounded text-sm transition-colors"
            >
              <Printer size={14} /> Open
            </button>
            <button
              onClick={handleShowInFolder}
              className="flex items-center justify-center gap-2 bg-[#2a2a2a] hover:bg-[#333] text-gray-200 p-2 rounded text-sm transition-colors"
            >
              <FolderOpen size={14} /> Reveal
            </button>
            {(isFusionCapable || linkedFusionFile) && (
              <button
                onClick={isFusionCapable ? handleOpenPath : handleOpenFusion}
                className="col-span-2 flex items-center justify-center gap-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-600/30 p-2 rounded text-sm transition-colors"
              >
                <Edit size={14} /> Edit in Fusion 360
              </button>
            )}
          </div>

          {/* Metadata Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Metadata</h3>
              <button
                onClick={() => editMode ? handleSave() : setEditMode(true)}
                className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
              >
                {editMode ? <><Save size={12}/> Save</> : <><Edit size={12}/> Edit</>}
              </button>
            </div>

            {editMode ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder={model.name}
                    className="w-full bg-[#2a2a2a] border border-gray-700 rounded px-2 py-1 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={e => setFormData({...formData, tags: e.target.value})}
                    className="w-full bg-[#2a2a2a] border border-gray-700 rounded px-2 py-1 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-[#2a2a2a] border border-gray-700 rounded px-2 py-1 text-sm text-white min-h-[60px]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    className="w-full bg-[#2a2a2a] border border-gray-700 rounded px-2 py-1 text-sm text-white min-h-[60px]"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Title</div>
                  <div className="text-sm">{model.metadata?.title || model.name}</div>
                </div>
                {model.metadata?.tags && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Tags</div>
                    <div className="flex flex-wrap gap-1">
                      {model.metadata.tags.split(',').map((t: string, i: number) => (
                        t.trim() && <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded border border-gray-700">{t.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
                {model.metadata?.description && (
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Description</div>
                    <div className="text-sm text-gray-300">{model.metadata.description}</div>
                  </div>
                )}
                {model.metadata?.notes && (
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Notes</div>
                    <div className="text-sm text-gray-400 italic">{model.metadata.notes}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-gray-800 pt-4 space-y-2 text-sm text-gray-400">
            <div className="flex justify-between">
              <span>File Type</span>
              <span className="text-gray-300 uppercase">{model.extension.replace('.', '')}</span>
            </div>
            <div className="flex justify-between">
              <span>Size</span>
              <span className="text-gray-300">{formatSize(model.size)}</span>
            </div>
            <div className="flex justify-between">
              <span>Modified</span>
              <span className="text-gray-300">{new Date(model.lastModified).toLocaleDateString()}</span>
            </div>
          </div>

          {model.versions.length > 0 && (
            <div className="border-t border-gray-800 pt-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Versions</h3>
              <div className="space-y-1">
                <div className="text-sm text-white bg-blue-900/20 border border-blue-900/50 px-2 py-1 rounded">
                  Current: {model.name}
                </div>
                {model.versions.map(vPath => {
                  const vModel = allModels.find(m => m.path === vPath)
                  if (!vModel) return null
                  return (
                    <div key={vPath} className="text-sm text-gray-400 px-2 py-1 truncate cursor-pointer hover:text-white" onClick={() => window.api.showItemInFolder(vPath)} title={vModel.name}>
                      {vModel.name}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
