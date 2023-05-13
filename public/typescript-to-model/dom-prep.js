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

const dark_theme_btn = document.getElementById('enable-dark-theme');
const light_theme_btn = document.getElementById('enable-light-theme');
const html_element = document.querySelector('html');
light_theme_btn.addEventListener('click', () => {
  html_element.setAttribute('data-bs-theme', 'dark');
  dark_theme_btn.classList.remove('active');
  light_theme_btn.classList.add('active');
});
dark_theme_btn.addEventListener('click', () => {
  html_element.setAttribute('data-bs-theme', 'light');
  dark_theme_btn.classList.add('active');
  light_theme_btn.classList.remove('active');
});

const toggleHeightByClass = (classname, height, toggleHeightBtnId) => {
    const toggleHeightBtn = document.getElementById(toggleHeightBtnId);
  let isExpanded = false;
  let isVisible = false;
  const elements = [...document.querySelectorAll(classname)];
  function autoHeight() {
    elements.forEach((el) => {
      el.style.height = "auto"; // Reset height to auto to recalculate based on content
      el.style.height = el.scrollHeight + "px";
      el.style.overflowY = "hidden";
    });
    isExpanded = true;
  }
  function setHeight() {
    elements.forEach((el) => {
      el.style.height = height;
      el.style.overflowY = "scroll";
    });
    isExpanded = false;
  }
  function show() {
    elements.forEach((el) => (el.style.display = "block"));
    toggleHeightBtn.style.display = "inline-block";
    isVisible = true;
  }
  function hide() {
    elements.forEach((el) => (el.style.display = "none"));
    isVisible = false;
    toggleHeightBtn.style.display = "none";
  }
  toggleHeightBtn.addEventListener("click", () => {
    if (isExpanded) {
        setHeight();
        toggleHeightBtn.textContent = "Expand output";
    } else {
        autoHeight();
        toggleHeightBtn.innerHTML = "Collapse output";
    }
    });

  return {
    height: () => (isExpanded ? setHeight() : autoHeight()),
    isExpanded: () => isExpanded,
    setHeight,
    autoHeight,
    display: () => (isVisible ? hide() : show()),
    isVisible: () => isVisible,
    show,
    hide,
  };
};

/**
 * Syncs the scrolling of all elements with the given classname
 * @param {string} classname
 */
const syncScrollingElements = (classname) => {
  const syncScroll = (e) => {
    scrollable.forEach((el) => {
      if (el !== e.target) {
        // Skip the element that triggered the event
        el.scrollTop = e.target.scrollTop; // match scroll positions
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

const toggleOutputs = toggleHeightByClass("pre.compare-output", "160px", "expand-output");
toggleOutputs.hide();