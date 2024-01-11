const DOC = {
  typescript: document.getElementById("typescript"),
  php_dto: document.getElementById("php-dto"),
  create_dto: document.getElementById("create-dto"),
};

const REGEX = {
  comment: /\/\*\*[^*]*\*+(?:[^\/*][^*]*\*+)*\//g,
  className: /export\s+type\s+([\w\s&]+)\s+=\s*/,
  property: /^(readonly)?[\s]*([\w]+)[\s]*([\?]*)[\s]*[\:]/,
  prop_data: /^(readonly)?\s*(\w+)[\s]*([\?]*):[\s]*([\w\s\|\'\"\[\]]+)/,
};

function get_prop_strings(lines) {
  const propstrings = [];
  let prop_lines = [];
  let section = "prop";
  const set_prop = () => {
    propstrings.push(prop_lines.join("\n"));
    prop_lines = [];
  };
  lines.forEach((line, i) => {
    if (line.startsWith("/**")) {
      if (prop_lines.length > 0) set_prop();
      prop_lines.push(line);
      section = line.endsWith("*/") ? "" : "comment";
    } else if (section === "comment") {
      prop_lines.push("  " + line);
      section = line.endsWith("*/") ? "" : "comment";
    } else if (section === "comment") {
      prop_lines.push("  " + line);
    } else if (section === "prop") {
      if (line.match(REGEX.property)) set_prop();
      prop_lines.push(line);
    } else {
      prop_lines.push(line);
      section = "prop";
    }
  });
  set_prop();
  return propstrings;
}

function get_props(str) {
  const com = str.match(REGEX.comment)?.map((c) => c.trim());
  let className = str.match(REGEX.className)[1].trim();
  const lines = str
    .slice(str.indexOf(className))
    .split("{")[1]
    .split("}")[0]
    .split("\n")
    .map((l) => l.trim())
    .map(l => l.replace(/^\/\/.*$/, ''))
    .filter((l) => l.length > 0);
  const prop_strings = get_prop_strings(lines);
  const properties = prop_strings.map((str) => {
    const comment = str
      .match(REGEX.comment)
      ?.map((c) => c.trim())
      .pop();
    str = str.replace(comment, "").trim().replace(/\n/g, "");
    const [params, inline_comment] = str.split("//").map((s) => s.trim());
    const [, readonly, property, nullable, raw_type] = params.match(
      REGEX.prop_data
    );
    const phpDocType = raw_type
      .replace("string", "string")
      .replace("number", "int")
      .replace("boolean", "bool");
    const type = phpDocType.indexOf("[]") !== -1 ? "array" : (phpDocType.indexOf("|") !== -1) ? 'string' : phpDocType;
    return {
      comment: comment.replace("/**", "").trim(),
      property,
      phpDocType,
      type,
      nullable,
      readonly,
      inline_comment,
    };
  });
  return { className, properties };
}

function createPHPClassTemplate({ className, properties }) {
  let class_props = [];
  let class_constructor = [];
  properties.forEach((prop) => {
    const { property, type, phpDocType, nullable, readonly, comment } = prop;
    if (comment) {
      class_props.push(`  /** @var ${phpDocType} ${comment}`);
    }
    if (readonly) {
      class_props.push(`  /** @readonly */`);
    }
    class_props.push(`  public ${nullable ? "?" : ""}${type} $${property};`);
    class_props.push(``);

    // Check if the type is an array of a specific class
    const arrayMatch = phpDocType.match(/(\w+)\[\]/);

    if (arrayMatch) {
      const arrayType = arrayMatch[1];
      class_constructor.push(
        `    $this->set_typed_array("${property}", ${arrayType}::class);`
      );
    } else if (type === "int" || type === "string" || type === "bool") {
      class_constructor.push(`    $this->set_prop("${property}");`);
    } else {
      class_constructor.push(
        `    $this->set_typed_prop("${property}", ${type}::class);`
      );
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
    "}",
  ].join("\n");
}

function transformTypeScriptToPHP(tsDeclaration) {
  const { className, properties } = get_props(tsDeclaration);
  const definition = createPHPClassTemplate({ className, properties });
  DOC.php_dto.textContent = definition;
  DOC.php_dto.style.display = "block";
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
DOC.php_dto.addEventListener("click", function () {
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(this);
  selection.removeAllRanges();
  selection.addRange(range);
});
