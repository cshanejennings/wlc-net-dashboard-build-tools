const fs = require('fs');
const path = require('path');

const map_folder = path.join(__dirname, '../../../map');
const json_map_path = path.join(__dirname, '../../map.json');

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

const data = JSON.parse(fs.readFileSync(json_map_path));
write_data(data);