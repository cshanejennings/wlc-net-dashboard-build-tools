function parseAndCompare(el, outputToggle) {
    const parseOptions = {
      typescript: (text) => {
        const regex = /(\w+): ([\w<>[\]]+);/g;
        return Array.from(text.matchAll(regex), (match) => ({
          item: match[1],
          property: match[2],
        }));
      },
      php_cast: (text) => {
        const regex = /'(\w+)' => '(\w+)'/g;
        return Array.from(text.matchAll(regex), (match) => ({
          item: match[1],
          property: match[2],
        }));
      },
    };
  
    const parse = (input) => {
      const parseKey = input.getAttribute("data-parser");
      const parser = parseOptions[parseKey];
      return parser(input.value);
    };
    const parsed = {
      left: parse(el.left),
      right: parse(el.right),
    };
  
    // Get all unique 'item' values from both arrays
    let allItems = new Set([
      ...parsed.left.map((el) => el.item),
      ...parsed.right.map((el) => el.item),
    ]);
  
    // Initialize the padded arrays
    const output = {
      left: [],
      right: [],
    };
  
    // For each unique item, add the corresponding line to each output array
    let line = 1;
    for (let item of allItems) {
      // Find the entry in leftParsed & rightParsedwith the current item
      const entry = {
        left: parsed.left.find((el) => el.item === item),
        right: parsed.right.find((el) => el.item === item),
      };

      const add_line = (current_side, other_side) => {
        const current_entry = entry[current_side];
        const other_entry = entry[other_side];
        const line_id = String(line).padStart(2, "0");
        const missing_class = (!current_entry) ? ` missing-${current_side}` : (!other_entry) ? ` missing-${other_side}` : "";
        const line_number = `<span class="line-number${missing_class}">${line_id}: </span>`;

        const prop = `<span class="auto-select property${missing_class}">${item}</span>`
        const line_text = current_entry
        ? `${line_number} ${prop} <span class="property-value">${current_entry.property}</span>`
        : `${line_number} ${prop}`

          output[current_side].push( `<span class="output-line">${line_text}</span>`);
      }

      add_line('left', 'right');
      add_line('right', 'left');
  
      line++;
    }
  
    document.getElementById("left-output").innerHTML = output.left.join("\n");
    document.getElementById("right-output").innerHTML = output.right.join("\n");
    outputToggle.display();
    outputToggle.autoHeight();
    document.querySelectorAll(".auto-select").forEach((el) => el.addEventListener("click", () => {
        selectText(el);
    }));
  }
  
  document
    .getElementById("compare-left-and-right")
    .addEventListener("click", () => {
      parseAndCompare({
        left: document.getElementById("left-input"),
        right: document.getElementById("right-input"),
      }, toggleOutputs)
    });
  