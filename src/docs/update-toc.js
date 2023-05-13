const toc = require("markdown-toc");
const fs = require("fs");
const path = require("path");

const clientReadMePath = path.join(__dirname, "../../../client/README.md");
const serverReadMePath = path.join(__dirname, "../../../server/README.md");

function updateReadMe (markdownPath) {
    const mdContent = fs.readFileSync(markdownPath, "utf8");
    
    // Generate the new TOC
    const newToc = toc(mdContent).content;
    const TOC_START_TOKEN = "<!-- tocstart -->";
    const TOC_STOP_TOKEN = "<!-- tocstop -->";
    
    function fixIndentationCharacters(toc) {
      const lines = toc
        .split("\n")
        .map((line) => line.replace(/^(\s*)(.+)(\s\[)/, "$1-$3"))
        .join("\n");
      return lines;
    }
    
    const tocBlock = [
      TOC_START_TOKEN,
      fixIndentationCharacters(newToc),
    //   newToc,
      TOC_STOP_TOKEN,
    ].join("\n");
    
    // Replace the existing TOC or insert the new TOC at the top of the file
    let updatedContent;
    if (mdContent.includes(TOC_START_TOKEN)) {
      // Replace the existing TOC
      const regex = new RegExp(`${TOC_START_TOKEN}(.|\\r?\\n)*${TOC_STOP_TOKEN}`);
      updatedContent = mdContent.replace(regex, tocBlock);
    } else {
      // Insert the new TOC at the top of the file
      updatedContent = newToc + "\n\n" + mdContent;
    }
    console.log(updatedContent);
    
    fs.writeFileSync(markdownPath, updatedContent, "utf8");
    
}

updateReadMe(clientReadMePath);
updateReadMe(serverReadMePath);