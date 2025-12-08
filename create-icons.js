const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Since we can't easily convert SVG to PNG/ICO without native dependencies,
// let's create a simple PNG using a data URL approach with sharp or svg2img
// For now, we'll use the @resvg/resvg-js package which is pure JS

async function convertIcons() {
    try {
        // Try to use resvg-js for conversion
        const { Resvg } = require('@resvg/resvg-js');

        const svgPath = path.join(__dirname, 'public', 'icon.svg');
        const svg = fs.readFileSync(svgPath, 'utf-8');

        // Convert to 512x512 PNG
        const resvg = new Resvg(svg, {
            fitTo: {
                mode: 'width',
                value: 512
            }
        });

        const pngData = resvg.render();
        const pngBuffer = pngData.asPng();

        // Save as PNG
        fs.writeFileSync(path.join(__dirname, 'public', 'icon.png'), pngBuffer);
        console.log('Created icon.png (512x512)');

        // Also create smaller sizes for ICO
        const sizes = [16, 32, 48, 64, 128, 256];
        for (const size of sizes) {
            const smallResvg = new Resvg(svg, {
                fitTo: {
                    mode: 'width',
                    value: size
                }
            });
            const smallPng = smallResvg.render().asPng();
            fs.writeFileSync(path.join(__dirname, 'public', `icon-${size}.png`), smallPng);
            console.log(`Created icon-${size}.png`);
        }

        console.log('\nPNG icons created successfully!');
        console.log('For ICO file, you can use an online converter like cloudconvert.com');
        console.log('or install png-to-ico: npm install png-to-ico');

    } catch (err) {
        console.error('Error:', err.message);
        console.log('\nInstalling @resvg/resvg-js...');
        execSync('npm install @resvg/resvg-js --save-dev', { stdio: 'inherit', cwd: __dirname });
        console.log('Please run this script again: node create-icons.js');
    }
}

convertIcons();
