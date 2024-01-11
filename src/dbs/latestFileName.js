const fs = require('fs');
const path = require('path');

module.exports = (folderPath, ext = '') => {
    try {
        const rawFiles = fs.readdirSync(folderPath);
        const filteredFiles = rawFiles
            .filter(file => (ext) ? file.endsWith(ext) : true)
            .map(file => ({ 
                file,
                mtime: fs.statSync(path.join(folderPath, file)).mtime 
            }))
            .sort((a, b) => b.mtime - a.mtime);

        return filteredFiles.length > 0 ? filteredFiles[0].file : null;
    } catch (error) {
        console.error('Error in latestFileName:', error);
        return null;
    }
};