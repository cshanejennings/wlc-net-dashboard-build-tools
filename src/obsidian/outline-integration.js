(function () {
    const CHAPTER_INDEX = 8;

    const sample = document.getElementById("sample");
    const result = document.getElementById("result");

    const PRIMARY_HEADLINE_REGEX = /^(\d+)\.\s*(.*)$/;
    const HEADLINE_REGEX = /^\#\# ([\d]+)\. (.+)$/;

    const get_section = (regex) => (line) => {
      const match = line.match(regex);
      return match ? { index: parseInt(match[1], 10), name: match[2].trim() } : null;
    };
    const get_outline = (str) => str.split("\n").map(get_section(PRIMARY_HEADLINE_REGEX)).filter((item) => item);
    const process = (str, outline_str) => {
      const get_content_headline = get_section(HEADLINE_REGEX);
      const headlines = str.split("\n").reduce((a, line) => {
        const headline = get_content_headline(line);
        if (headline) { a.push(headline); }
        return a;
      }, []);
      return get_outline(outline_str).map(({ index, name }) => {
        const lines = [
            `${index}. ${name}`,
        ];
        if (index === CHAPTER_INDEX) {

          headlines.forEach((headline) => {
            lines.push(`\t${index}.${headline.index}. ${headline.name}`);
          })
        }
        return lines.join('\n');
      }).join('\n');
    };
    if(result) {
        result.value = process(sample.value, result.value);
    } else {
        console.log(process(sample.value));
    }
  })();