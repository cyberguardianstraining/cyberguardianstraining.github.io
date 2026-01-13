// Demo download functionality
async function downloadDemo(demoName) {
    try {
        // Check if we're running on file:// protocol
        if (window.location.protocol === 'file:') {
            alert('Download feature requires the site to be served over HTTP/HTTPS.\n\nFor local testing, please use a local web server (e.g., "python -m http.server" or VS Code Live Server).\n\nThis will work fine once deployed to GitHub Pages.');
            return;
        }

        // Define the files to download for each demo
        const filesToDownload = [
            'index.html',
            'style.css',
            'script.js'
        ];

        // Load JSZip from CDN if not already loaded
        if (typeof JSZip === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
        }

        const zip = new JSZip();
        const demoFolder = zip.folder(demoName);
        let filesAdded = 0;

        // Fetch each file and add to zip
        for (const file of filesToDownload) {
            try {
                const response = await fetch(`demos/${demoName}/${file}`);
                if (response.ok) {
                    const content = await response.text();
                    demoFolder.file(file, content);
                    filesAdded++;
                    console.log(`Added ${file} to zip`);
                } else {
                    console.warn(`File not found: ${file} (${response.status})`);
                }
            } catch (error) {
                console.warn(`Could not fetch ${file}:`, error);
            }
        }

        // Check if any files were added
        if (filesAdded === 0) {
            alert('No files could be downloaded. The demo might not have any downloadable files yet.');
            return;
        }

        console.log(`Creating zip with ${filesAdded} file(s)`);

        // Generate zip and trigger download
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${demoName}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('Download complete!');

    } catch (error) {
        console.error('Error downloading demo:', error);
        alert('Sorry, there was an error downloading the demo. Please check the console for details.');
    }
}

// Helper function to dynamically load scripts
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
