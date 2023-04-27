import 'module-alias/register';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import manifest from 'manifest/api-snippet.manifest.json';
import { ManiFestInsertAPI, get_insert_api_variables } from 'manifest/manifest-types';
console.log("Current script directory:", __dirname);

function replace_tokens(template: string, variables: Record<string, string>): string {
  return Object.keys(variables).reduce((result, key) => {
    return result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), variables[key]);
  }, template);
}

function insert_token_if_not_exists(file: string, token: string): void {
  const content = fs.readFileSync(file, 'utf-8');

  if (!content.includes(token)) {
    const updated_content = content.replace(/(class .*?{[\s\S]*?)(\n})/g, `$1\n    ${token}\n$2`);
    fs.writeFileSync(file, updated_content, 'utf-8');
  }
}
const template_variables = get_insert_api_variables(manifest.variables);



function insert_code(): void {
  (manifest.files as ManiFestInsertAPI[]).forEach((file) => {
    const template_path = path.resolve(__dirname, file.template);
    const content_path = path.resolve(__dirname, file.path);
    const update_file = () => {
      const template = fs.readFileSync(template_path, 'utf-8').split('--example--')[0];
      const content = fs.readFileSync(content_path, 'utf-8');

      const replaced_template = replace_tokens(template, template_variables);
      const new_content = content.replace(file.token, `${replaced_template}\n${file.token}`);

      fs.writeFileSync(content_path, new_content, 'utf-8');
    }
    console.log(content_path);

    if (file.createController) {
      exec(`php artisan make:controller ${file.createController}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error creating controller: ${error}`);
          return;
        }
        console.log(stdout);
        insert_token_if_not_exists(file.path, file.token);
        update_file();
      });
    } else {
      update_file();
    }
  });
}

insert_code();
