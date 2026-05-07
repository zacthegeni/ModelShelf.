import fs from 'fs/promises'
import { join } from 'path'
import { app } from 'electron'

const dbPath = join(app.getPath('userData'), 'metadata.json')

let metadata: Record<string, any> = {}

export async function loadMetadata() {
  try {
    const data = await fs.readFile(dbPath, 'utf8')
    metadata = JSON.parse(data)
  } catch (error) {
    // If file doesn't exist, start fresh
    metadata = {}
    await saveMetadata()
  }
  return metadata
}

export async function saveMetadata() {
  await fs.writeFile(dbPath, JSON.stringify(metadata, null, 2))
}

export function getMetadata() {
  return metadata
}

export async function updateMetadata(filePath: string, data: any) {
  metadata[filePath] = { ...metadata[filePath], ...data }
  await saveMetadata()
  return metadata
}
