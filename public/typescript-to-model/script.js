const parseTypeScript = (text) => {
    const regex = /(\w+): ([\w<>[\]]+);/g;
    return Array.from(text.matchAll(regex), (match) => ({
      item: match[1],
      property: match[2],
    }));
  };
  
  const parsePHP = (text) => {
    const regex = /'(\w+)' => '(\w+)'/g;
    return Array.from(text.matchAll(regex), (match) => ({
      item: match[1],
      property: match[2],
    }));
  };
  
  const print_properties = (arr) =>
    arr.map(({ item, property }) => `${item} > ${property}`);
  
  function parseAndCompare() {
    let tsInput = document.getElementById("typescriptInput").value;
    let phpInput = document.getElementById("phpInput").value;
  
    let tsParsed = parseTypeScript(tsInput);
    let phpParsed = parsePHP(phpInput);
  
    // Get all unique 'item' values from both arrays
    let allItems = new Set([
      ...tsParsed.map((el) => el.item),
      ...phpParsed.map((el) => el.item),
    ]);
  
    // Initialize the padded arrays
    let tsOutputPadded = [];
    let phpOutputPadded = [];
  
    // For each unique item, add the corresponding line to each output array
    let line = 1;
    for (let item of allItems) {
      // Find the entry in tsParsed with the current item
  
      let tsEntry = tsParsed.find((el) => el.item === item);
      const left_line_number = `<span class="line-number${
        !tsEntry ? " missing-left" : ""
      }">${String(line).padStart(2, "0")}: </span>`;
      tsOutputPadded.push(
        tsEntry
          ? `${left_line_number} ${tsEntry.item} > ${tsEntry.property}`
          : `${left_line_number} `
      );
  
      // Find the entry in phpParsed with the current item
      let phpEntry = phpParsed.find((el) => el.item === item);
      const right_line_number = `<span class="line-number${
        !phpEntry ? " missing-right" : ""
      }">${String(line).padStart(2, "0")}: </span>`;
      phpOutputPadded.push(
        phpEntry
          ? `${right_line_number} ${phpEntry.item} > ${phpEntry.property}`
          : `${right_line_number} `
      );
  
      line++;
    }
  
    document.getElementById("typescriptOutput").innerHTML =
      tsOutputPadded.join("\n");
    document.getElementById("phpOutput").innerHTML = phpOutputPadded.join("\n");
  }
  
  function selectText(element) {
    if (document.selection) {
      var range = document.body.createTextRange();
      range.moveToElementText(element);
      range.select();
    } else if (window.getSelection) {
      var range = document.createRange();
      range.selectNodeContents(element);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
    }
  }
  
  /**
   * Syncs the scrolling of all elements with the given classname
   * @param {string} classname
   */
  const syncScrollingElements = (classname) => {
    const syncScroll = (e) => {
      scrollable.forEach((el) => {
        // Skip the element that triggered the event
        if (el !== e.target) {
          // Set the scrollTop of the other element to match the scrollTop of the current element
          el.scrollTop = e.target.scrollTop;
        }
      });
    };
  
    // Add the event listener to each scrollable element with the given classname
    const scrollable = [...document.getElementsByClassName(classname)].map(
      (el) => {
        el.addEventListener("scroll", syncScroll);
        return el;
      }
    );
  };
  
  syncScrollingElements("sync-scroll");
  