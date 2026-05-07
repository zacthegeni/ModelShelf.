# ModelShelf

A local-first Windows desktop app for organizing 3D model files (STL, 3MF, STEP, OBJ, and Fusion 360 files).

## Features

- **Folder Watching:** Automatically scans a folder you choose for 3D files. Just drop files in with Windows Explorer.
- **3D Previews:** Live 3D preview of STL files right in the grid. Hover over them to see them spin!
- **Fast Search:** Fuzzy search by file name, tags, description, notes, or version.
- **Metadata Management:** Add tags, descriptions, and notes without modifying your actual files. All metadata is stored locally.
- **Version Grouping:** Automatically groups related files like `clip_v1.stl` and `clip_v2.stl` to keep your view clean.
- **Integrations:** Easily open files in your default Slicer (like Bambu Studio) or edit linked `.f3d` files directly in Fusion 360.

## How to use

1. Run the app.
2. Click **Choose Folder** in the top left and pick the main directory where you keep your 3D models.
3. The app will quickly scan and show all your models.
4. Click on any model to open the **Details Panel** where you can:
    - View a large 3D preview.
    - Edit metadata (Title, Tags, Notes, Description).
    - See the file's path, size, and modification date.
    - Click **Open** to send it to your slicer.
    - Click **Reveal** to open the folder in Windows Explorer.
    - Click **Edit in Fusion 360** if a related Fusion project file is found in the same folder.

## Storage and Privacy

**No cloud storage.**
This app is fully local. It does not upload your files anywhere.
Your metadata (tags, notes, etc.) is safely stored in your local AppData folder (`%APPDATA%\modelshelf\metadata.json`) so it survives app updates and won't clutter your 3D model folders.

## Development

If you want to modify the source code or run it in development mode:

### Prerequisites
- Install [Node.js](https://nodejs.org/en/)

### Setup

1. Open your terminal in this folder.
2. Install dependencies:
   `npm install`
3. Run the development environment:
   `npm run dev`

### Building the Windows Installer

If you've made changes and want to create a `.exe` installer:

`npm run dist`

The resulting installer will be located in the `dist/` folder.

## GitHub Actions

The repository includes a GitHub Actions workflow that will automatically build the Windows installer whenever you create a new GitHub release tag (e.g. `v1.0.0`).
