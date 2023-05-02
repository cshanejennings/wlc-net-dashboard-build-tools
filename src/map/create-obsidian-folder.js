const fs = require('fs');
const path = require('path');

const root_path = (path.join(__dirname, '../../../client'));
const src_path = path.join(root_path, 'src');
const IMPORT_REGEX = /import\s+(?:{([^}]+)}|([^'";\n]+))\s+from\s+['"]([^'"]+)['"]((?![\s\S]*\/\/)[\s\S]*?(?![\s\S]*\/\*))/gm;
const TARGET_FILE_EXTENSION = /\.(jsx|js|tsx|ts)$/;

const remove_comments = (str) => {
    return str.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
}

const clean_imports = (imports) => imports.split(/,\s*/)
  .map(s => s.replace(/\{|\}|^type/g, '').trim())
  .filter(s => (
    s.length > 0
    && !s.match(/^\/\/ /)
));

const get_dependencies = (manual = []) => {
    const json = JSON.parse(fs.readFileSync(path.join(root_path, 'package.json')));
    const dependencies = json.dependencies || {};
    const dev_dependencies = json.devDependencies || {};
    return [...manual, ...Object.keys(dependencies), ...Object.keys(dev_dependencies)]
}

const get_imports = (raw_import_urls) => Array.from(raw_import_urls,
    ([, namedImports, defaultImport, fromUrl]) => {
    const imports = clean_imports(namedImports || defaultImport);
    const from = fromUrl.replace(TARGET_FILE_EXTENSION, "");
    return { imports, from };
});

const dependency_keys = get_dependencies(["prop-types"]);
const get_src_from_import = ({ from, imports }) => {
    const dependency = dependency_keys.find((key) => from.startsWith(key));
    return dependency ? `#${dependency}` : from.replace(/\./g, "_");
};

const get_asset_path = (file_path) => {
    return file_path
        .replace(/\\/g, '/')
        .replace(/.*client\//, '')
        .split('.').slice(0, -1).join('_');
}

async function crawl_directory(directory) {
  const get_filepath = (file_name) => path.join(directory, file_name);
  const files = await fs.promises.readdir(directory, { withFileTypes: true });
  const result = {};
  for (const file of files) {
    const file_path = get_filepath(file.name);
    if (file.isDirectory()) {
      const subdirResult = await crawl_directory(file_path);
      Object.assign(result, subdirResult);
    } else if (file.isFile() && TARGET_FILE_EXTENSION.test(file.name)) {
      const asset_path = get_asset_path(file_path);
      const file_content = await fs.promises.readFile(file_path, 'utf8');
      const raw_import = remove_comments(file_content).matchAll(IMPORT_REGEX);
      const imports = get_imports(raw_import);
      result[asset_path] = [...new Set(imports.flatMap(get_src_from_import).sort())];
    }
  }
  const json = JSON.stringify(result, null, 2);
  await fs.promises.writeFile('map.json', json);
  return result;
}

const map_folder = path.join(__dirname, '../../../map');
const sanitize_content_line = (item) => {
    item = item.replace("@", "");
    return (item.indexOf('#') === 0) ? `${item}\n` : `[[${item}]]\n`
}

const write_data = (data) => {
    // Create folders and files according to the keys in the data object
    for (const key in data) {
        const folder_path = path.join(map_folder, path.dirname(key));
        fs.mkdirSync(folder_path, { recursive: true });

        const raw_file_path = path.join(map_folder, `${key}.md`);
        const parts = raw_file_path.split('\\');
        const file_name = parts.pop()
            .replace(/\./g, '_')
            .replace(/_md$/, ".md");
        const file_path = [...parts, file_name].join('\\');
        const contents = data[key].map(sanitize_content_line).join('');
        fs.writeFileSync(file_path, contents)
    }
}

const file_map = crawl_directory(path.join(src_path));
write_data(file_map);
