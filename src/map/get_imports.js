const fs = require('fs');
const path = require('path');

const root_path = (path.join(__dirname, '../../../client'));
const src_path = path.join(root_path, 'src');
const OMPORT_REGEX = /import\s+(?:{[^}]+}|[^'";\n]+)\s+from\s+['"]([^'"]+)['"]/g;
const IMPORT_REGEX = /import\s+(?:{([^}]+)}|([^'";\n]+))\s+from\s+['"]([^'"]+)['"]/g;
const VALID_FILE = /\.(jsx|js|tsx|ts)$/;

async function crawl_directory(directory) {
  const get_filepath = (file_name) => path.join(directory, file_name);
  const files = await fs.promises.readdir(directory, { withFileTypes: true });
  const result = {};
  for (const file of files) {
    const file_path = get_filepath(file.name);
    if (file.isDirectory()) {
      const subdirResult = await crawl_directory(file_path);
      Object.assign(result, subdirResult);
    } else if (file.isFile() && VALID_FILE.test(file.name)) {
      const file_content = await fs.promises.readFile(file_path, 'utf8');
      const raw_import_urls = file_content.matchAll(IMPORT_REGEX);
      const imports = Array.from(raw_import_urls, ([, namedImports, defaultImport, fromUrl]) => ({
        imports: (namedImports || defaultImport).split(/,\s*/), 
        from: fromUrl
      })).flatMap(obj => obj.imports);
      const asset_path = file_path.replace(/\\/g, '/').replace(/.*client\//, '');
      result[asset_path] = imports;
    }
  }
  const json = JSON.stringify(result, null, 2);
  await fs.promises.writeFile('map.json', json);
  
  return result;
}

crawl_directory(path.join(src_path));
