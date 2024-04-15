const applyDiffs = (ctx, key, diffs) => {
  // reverse diffs
  const rdiffs = [];

  // initialize key index
  const _keyIndex = [];
  if ("length" in ctx[key]) {
    for (let i = 0; i < ctx[key].length; i++) {
      _keyIndex.push(i);
    }
  }

  // key index utils
  const getKeyIndex = (i) => {
    if (i < 0) return 0;
    if (_keyIndex.length - 1 < i) return _keyIndex.length;
    return _keyIndex[i];
  };
  const updateKeyIndex = (start, delta) => {
    for (let i = start; i < _keyIndex.length; i++) {
      _keyIndex[i] += delta;
    }
  };

  // apply diffs
  for (const diff of diffs) {
    // dict add
    if (diff.op === "add") {
      const rdiff = { op: "remove", key: diff.key };
      ctx[key][diff.key] = diff.value;
      rdiffs.push(rdiff);
    }

    // dict|seq patch
    else if (diff.op === "patch") {
      const rdiff = { op: "patch", key: diff.key };
      rdiff.diff = applyDiffs(ctx[key], diff.key, diff.diff);
      rdiffs.push(rdiff);
    }

    // dict remove
    else if (diff.op === "remove") {
      const rdiff = { op: "add", key: diff.key, value: ctx[key][diff.key] };
      delete ctx[key][diff.key];
      rdiffs.push(rdiff);
    }

    // dict replace
    else if (diff.op === "replace") {
      const rdiff = { op: "replace", key: diff.key, value: ctx[key][diff.key] };
      ctx[key][diff.key] = diff.value;
      rdiffs.push(rdiff);
    }

    // seq addrange
    else if (diff.op === "addrange") {
      // str addrange
      if (typeof ctx[key] === "string") {
        const idx = getKeyIndex(diff.key);
        const fst = ctx[key].substring(0, idx);
        const lst = ctx[key].substring(idx);
        const mid = diff.valuelist.join("");
        const rdiff = { op: "removerange", key: diff.key, length: mid.length };
        ctx[key] = fst + mid + lst;
        updateKeyIndex(diff.key, mid.length);
        rdiffs.push(rdiff);
      }
      // arr addrange
      else {
        const vals = diff.valuelist;
        const rdiff = { op: "removerange", key: diff.key, length: vals.length };
        ctx[key].splice(getKeyIndex(diff.key), 0, ...vals);
        updateKeyIndex(diff.key, vals.length);
        rdiffs.push(rdiff);
      }
    }

    // seq removerange
    else if (diff.op === "removerange") {
      // str removerange
      if (typeof ctx[key] === "string") {
        const idx = getKeyIndex(diff.key);
        const fst = ctx[key].substring(0, idx);
        const lst = ctx[key].substring(idx + diff.length);
        const mid = ctx[key].substring(idx, idx + diff.length);
        const rdiff = { op: "addrange", key: diff.key, valuelist: [mid] };
        ctx[key] = fst + lst;
        updateKeyIndex(diff.key, -diff.length);
        rdiffs.push(rdiff);
      }
      // arr removerange
      else {
        const rdiff = { op: "addrange", key: diff.key };
        rdiff.valuelist = ctx[key].splice(getKeyIndex(diff.key), diff.length);
        updateKeyIndex(diff.key, -diff.length);
        rdiffs.push(rdiff);
      }
    }
  }

  return rdiffs.reverse();
};

(function () {
  const diff = [__diff__];

  const rdiff = Array(diff.length).fill(null);

  const notebook = { cells: [], metadata: {} };

  const delta = 5;

  let index = 0;

  let startX, startY;

  const updateNotebook = (diff) => {
    const rev = applyDiffs({ notebook }, "notebook", diff[index]);
    const div = document.querySelector("#notebook-holder");
    const nbk = nb.parse(notebook).render();
    div.innerHTML = "";
    div.appendChild(nbk);
    Prism.highlightAll();
    return rev;
  };

  window.addEventListener("mousedown", function (event) {
    startX = event.clientX;
    startY = event.clientY;
  });

  window.addEventListener("mouseup", function (event) {
    const dx = Math.abs(event.clientX - startX);
    const dy = Math.abs(event.clientY - startY);
    if (dx < delta && dy < delta) {
      const r = event.clientX / window.innerWidth;
      if (r < 1 / 3) {
        if (0 < index) {
          index--;
          updateNotebook(rdiff);
        } else {
          alert("No previous notebook");
        }
      } else if (2 / 3 < r) {
        if (index < diff.length) {
          rdiff[index] = updateNotebook(diff);
          index++;
        } else {
          alert("No next notebook");
        }
      }
    }
  });

  window.addEventListener("dblclick", function (event) {
    const r = event.clientX / window.innerWidth;
    if (1 / 3 < r && r < 2 / 3) {
      let i = Number.MAX_SAFE_INTEGER;
      if (index < 1) return;
      for (const df of diff[index - 1]) {
        if (df.op !== "patch") continue;
        if (df.key !== "cells") continue;
        for (const d of df.diff) if (d.key < i) i = d.key;
      }
      if (i !== Number.MAX_SAFE_INTEGER) {
        const div = document.querySelector(".nb-worksheet");
        div.childNodes[i].scrollIntoView();
      }
    }
  });
})();
