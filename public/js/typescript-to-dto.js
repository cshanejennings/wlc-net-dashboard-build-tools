const DOC = {
  typescript: document.getElementById("typescript"),
  php_dto: document.getElementById("php-dto"),
  create_dto: document.getElementById("create-dto"),
};

function extractPropertiesFromTypeScript(tsDeclaration) {
  const lines = tsDeclaration.split('\n');
  let className = '';
  let properties = [];
  let insideClass = false;
  let comment = '';

  lines.forEach((line) => {
    line = line.trim();
    if (line.startsWith('/**')) {
      comment = line;
    } else if (line.endsWith('*/')) {
      comment += ' ' + line;
    } else if (line.startsWith('export type')) {
      className = line.split(' ')[2];
      insideClass = true;
    } else if (insideClass && line.startsWith('}')) {
      insideClass = false;
    } else if (insideClass && line.length > 0) {
      const readonly = line.includes('readonly');
      const propertyLine = line.split('*/')[1]?.trim() || line;
      const parts = propertyLine.replace('readonly', '').split(':');
      if (parts.length < 2) return;
      const [property, typeInfo] = parts;
      const nullable = property.includes('?');
      const propertyName = property.replace('?', '').trim();
      let phpDocType = typeInfo.split(';')[0].trim().replace('| null', '');
      let type = typeInfo.split(';')[0].trim().replace('| null', '');
      // Check if the type contains '|' character, indicating a union of string literals
      if (type.includes('|')) {
        type = 'string'; // Treat as string type
        // Optionally, you can capture the accepted values and store them
        // const acceptedValues = phpType.split('|').map(value => value.trim().replace(/'/g, '')); 
      } else {
        type = type.replace('string', 'string').replace('number', 'int').replace('boolean', 'bool');
      }
      type = (type.indexOf('[]') !== -1) ? 'array' : type;


      properties.push({
        comment: comment.replace('/**', ' ').replace('*/', ' ').trim(),
        property: propertyName,
        phpDocType,
        type,
        nullable,
        readonly,
        // acceptedValues, // Optionally include accepted values if needed
      });
      comment = ''; // Reset comment
    }
  });

  return { className, properties };
}



function createPHPClassTemplate({ className, properties }) {
  let class_props = [];
  let class_constructor = [];
  properties.forEach((prop) => {
    const { property, type, phpDocType, nullable, readonly, comment } = prop;
    if (comment) {
      class_props.push(`  /** @var ${phpDocType} ${comment} */`);
    }
    if (readonly) {
      class_props.push(`  /** @readonly */`);
    }
    class_props.push(`  public ${nullable ? '?' : ''}${type} $${property};`);
    class_props.push(``);
    
    // Check if the type is an array of a specific class
    const arrayMatch = phpDocType.match(/(\w+)\[\]/);

    if (arrayMatch) {
      const arrayType = arrayMatch[1];
      class_constructor.push(`    $this->set_typed_array("${property}", ${arrayType}::class);`);
    } else if (type === 'int' || type === 'string' || type === 'bool') {
      class_constructor.push(`    $this->set_prop("${property}");`);
    } else {
      class_constructor.push(`    $this->set_typed_prop("${property}", ${type}::class);`);
    }
  });
  return [
    `<?php`,
    `namespace App\\Services\\Shopify\\DTO;`,
    `use App\\Services\\DTOBase;`,
    `class ${className} extends DTOBase`,
    `{`,
    ...class_props,
    `  public function __construct(array $data)`,
    `  {`,
    `    parent::__construct($data);`,
    ...class_constructor,
    `  }`,
    '}'
  ].join('\n');
}

function transformTypeScriptToPHP(tsDeclaration) {
  const { className, properties } = extractPropertiesFromTypeScript(tsDeclaration);
  const definition = createPHPClassTemplate({ className, properties });
  DOC.php_dto.textContent = definition;
  DOC.php_dto.style.display = 'block';
}




function createDTOClass(el, outputToggle) {
  const tsDeclaration = el.input.value;
  const phpClass = transformTypeScriptToPHP(tsDeclaration);
  console.log(phpClass);
}

DOC.create_dto.addEventListener("click", () => {
  createDTOClass(
    {
      input: DOC.typescript,
    },
    toggleOutputs
  );
});
DOC.php_dto.addEventListener('click', function() {
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(this);
  selection.removeAllRanges();
  selection.addRange(range);
});