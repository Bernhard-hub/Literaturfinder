const fs = require('fs');
const path = require('path');

// Simple ICO file creator from PNG
// ICO format: Header + Directory entries + Image data

async function createIco() {
    const publicDir = path.join(__dirname, 'public');
    const pngFile = path.join(publicDir, 'icon-256.png');

    if (!fs.existsSync(pngFile)) {
        console.error('icon-256.png not found!');
        process.exit(1);
    }

    const png256 = fs.readFileSync(pngFile);

    // Read PNG dimensions from header
    const width = 256;
    const height = 256;

    // ICO Header (6 bytes)
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);      // Reserved
    header.writeUInt16LE(1, 2);      // Type: 1 = ICO
    header.writeUInt16LE(1, 4);      // Number of images

    // Directory Entry (16 bytes per image)
    const dirEntry = Buffer.alloc(16);
    dirEntry.writeUInt8(0, 0);       // Width (0 = 256)
    dirEntry.writeUInt8(0, 1);       // Height (0 = 256)
    dirEntry.writeUInt8(0, 2);       // Color palette
    dirEntry.writeUInt8(0, 3);       // Reserved
    dirEntry.writeUInt16LE(1, 4);    // Color planes
    dirEntry.writeUInt16LE(32, 6);   // Bits per pixel
    dirEntry.writeUInt32LE(png256.length, 8);  // Image size
    dirEntry.writeUInt32LE(22, 12);  // Offset (6 + 16 = 22)

    // Combine all parts
    const ico = Buffer.concat([header, dirEntry, png256]);

    fs.writeFileSync(path.join(publicDir, 'icon.ico'), ico);
    console.log('Created icon.ico successfully!');
}

createIco();
