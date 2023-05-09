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
const material_ui_core_imports = {};
const material_ui_lab_imports = {};
const material_ui_icon_imports = {};

const add_imported_count = (counter, import_name) => {
  if (!import_name) { return; }
  const count = counter[import_name] ?? 0;
  counter[import_name] = count + 1;
}

const add_imported = (from, imports, counter) => {
  if (imports.length === 1 && from.trim().length) {
    const import_name = from.split('/').pop();
    add_imported_count(counter, import_name);
  }
  else if (imports.length) { imports.map(import_name => add_imported_count(counter, import_name))}
}

const dependency_keys = get_dependencies(["prop-types"]);
const get_src_from_import = ({ from, imports }) => {
    const dependency = dependency_keys.find((key) => from.startsWith(key));
    const src = dependency ? `#${dependency}` : from.replace(/\./g, "_");
    if (from.startsWith('@material-ui/core')) { add_imported(from.replace('@material-ui/core', ''), imports, material_ui_core_imports); }
    if (from.startsWith('@material-ui/lab')) { add_imported(from.replace('@material-ui/lab', ''), imports, material_ui_lab_imports); }
    if (from.startsWith('@material-ui/icons')) { add_imported(from.replace('@material-ui/icons', ''), imports, material_ui_icon_imports); }
    return src;
    // return dependency ? `#${dependency}` : from.replace(/\./g, "_");
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

const crawl_directory = async(path.join(src_path));


// MUI EXPORT SECTION
const get_count_array = (counter) => Object.entries(counter)
  .map((import_name) => ({import_name, count: counter[import_name] }))
  .filter(({import_name}) => (import_name))
  .sort((a, b) => (b.import_name > a.import_name))
  // .sort((a, b) => (b.count - a.count))
  .map(({import_name, count}) => `${import_name}: ${count}`)
  console.log(material_ui_lab_imports);
const material_ui_imports = {
  "@material-ui/core": get_count_array(material_ui_core_imports),
  "@material-ui/lab": get_count_array(material_ui_lab_imports),
  "@material-ui/icons": get_count_array(material_ui_icon_imports),
};
await fs.promises.writeFile('mui.json', JSON.stringify(material_ui_imports, null, 2));