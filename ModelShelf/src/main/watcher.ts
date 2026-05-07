import chokidar from 'chokidar'
import path from 'path'
import fs from 'fs'
import { getMetadata } from './metadata'

const SUPPORTED_EXTENSIONS = new Set([
  '.stl', '.3mf', '.obj', '.glb', '.gltf', '.step', '.stp', '.f3d', '.f3z', '.3dm', '.amf'
])

export interface ModelFile {
  path: string
  name: string
  extension: string
  size: number
  lastModified: number
  metadata: any
  versions: string[]
  relatedFiles: string[]
}

let watcher: any | null = null
let currentModels: Map<string, ModelFile> = new Map()

export function startWatching(folderPath: string, onUpdate: (models: ModelFile[]) => void) {
  if (watcher) {
    watcher.close()
  }

  currentModels.clear()

  watcher = chokidar.watch(folderPath, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    depth: 10
  })

  const scanFile = (filePath: string) => {
    const ext = path.extname(filePath).toLowerCase()
    if (!SUPPORTED_EXTENSIONS.has(ext)) return

    try {
      const stats = fs.statSync(filePath)
      const model: ModelFile = {
        path: filePath,
        name: path.basename(filePath, ext),
        extension: ext,
        size: stats.size,
        lastModified: stats.mtimeMs,
        metadata: getMetadata()[filePath] || {},
        versions: [], // We'll compute this later
        relatedFiles: []
      }
      currentModels.set(filePath, model)
      triggerUpdate()
    } catch (e) {
      console.error(`Error reading ${filePath}`, e)
    }
  }

  let debounceTimer: NodeJS.Timeout
  const triggerUpdate = () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      onUpdate(computeRelationships(Array.from(currentModels.values())))
    }, 300)
  }

  watcher
    .on('add', scanFile)
    .on('change', scanFile)
    .on('unlink', (filePath) => {
      currentModels.delete(filePath)
      triggerUpdate()
    })
    .on('ready', triggerUpdate)
}

function computeRelationships(models: ModelFile[]): ModelFile[] {
  const modelMap = new Map(models.map(m => [m.path, m]))

  // Group by base name for versioning (e.g. clip_v1 -> base: clip)
  const versionRegex = /([-_])?v\d+([-_].*)?$/i

  models.forEach(model => {
    const dir = path.dirname(model.path)

    // Find related files in the same directory
    model.relatedFiles = models
      .filter(m => m.path !== model.path && path.dirname(m.path) === dir && (m.name.startsWith(model.name) || model.name.startsWith(m.name)))
      .map(m => m.path)

    // Try to guess base name
    const match = model.name.match(versionRegex)
    let baseName = model.name
    if (match) {
        baseName = model.name.substring(0, match.index)
    }

    // Find versions
    model.versions = models
      .filter(m => m.path !== model.path && path.dirname(m.path) === dir && (m.name.startsWith(baseName) || baseName.startsWith(m.name)))
      .map(m => m.path)
  })

  return models
}
