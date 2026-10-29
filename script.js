
(() => {
  "use strict";

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const STORE = "dinglefork.casefile.v2";

  const freshState = () => ({
    seen: [],
    solved: [],
    endings: [],
    consoleUnlocked: false,
    backupUnlocked: false,
    finalUnlocked: false,
    strangeCount: 0,
    guestbookRead: false
  });

  let state = freshState();

  try {
    state = {
      ...state,
      ...JSON.parse(localStorage.getItem(STORE) || "{}")
    };
  } catch (_) {}

  const files = {
    readme: {
      title: "readme.txt",
      text: `HELLO!

Thanks for visiting my homepage. Everything here is normal and very much under control.

If you find a file called old_log.txt, compare it with the calendar. One of them has been copied too many times.

The first instruction is hiding in plain sight. Read the updates from top to bottom.

- DingleFork`
    },

    inventory: {
      title: "inventory.txt",
      text: `ARCHIVE INVENTORY / 10-14-03

01. photographs (12)
02. school notes (31)
03. web scraps (7)
04. visitor list (1)
05. temporary files (0)

There should be SIX folders. There are FIVE.

The missing folder had hands but never held anything. It measured something that nobody could agree on.

Do not count the files. Count the absent folder.`
    },

    log: {
      title: "old_log.txt",
      text: `ARCHIVE LOG — COPIED FROM THE OLD MACHINE

10/02/03  homepage created
10/11/03  guestbook fixed
10/14/03  backup completed
10/14/03  backup completed
10/14/03  backup completed

10/15/03  visitor detected
10/15/03  visitor detected
10/15/03  visitor detected

The log claims three visitors arrived on the fifteenth. The guestbook says one of them was already here the day before.

Compare the calendar. Repetition is not proof.`
    },

    calendar: {
      title: "calendar.txt",
      text: `OCTOBER 2003 — DINGLEFORK

02 — homepage created
11 — guestbook fixed
14 — backup completed
15 — [blank]  (this square has been rubbed thin)

On the back, in pencil:
"For the second lock, read the dates backwards. Not the digits. The order."

The calendar is not a code by itself. Find what the log repeats first.`
    },

    note: {
      title: "note_to_self.txt",
      text: `NOTE TO SELF

I hid the folder name in the inventory description.
The first key is not a date.

For the next key, take the guestbook claim that cannot be true. Find the visitor who appears twice: once in the log and once in the transcript. Their message tells you what to do with the calendar.

Seven is the answer to a question nobody asked. It is not a password.`
    },

    transcript: {
      title: "visitor_transcript.log",
      text: `VISITOR LOG — LOCAL COPY

VISITOR 001: hello, nice site
VISITOR 002: where is the owner?
VISITOR 003: why is my name in the source?
VISITOR 004: There were only three of us yesterday.

[THE FOLLOWING LINE IS IN A DIFFERENT TYPEFACE]
VISITOR 004: READ THE DATES BACKWARDS

VISITOR 005: I didn't type that.

The last visitor number does not match the guestbook. Do not trust the order this file is displayed in.`
    },

    index: {
      title: "index_old.html",
      text: `OLD INDEX NOTES

The path is made from three pieces:
DINGLE / FORK / TOENAIL

Do not put spaces between them. This is not a URL. It is the name of the person the archive remembers.

The console can only open a record after the first key is verified.`
    },

    receipt: {
      title: "copy_receipt.txt",
      text: `COPY REPORT / 10-15-03

Original files: 4
Copies made: 3
Copies with matching timestamps: 3

The original visitor record is missing. Three copies agree with each other, but all three were made from the same copy.

If every witness repeats the same sentence, you have one witness—not three.`
    }
  };

  const save = () => {
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
    } catch (_) {}
  };

  const has = id => state.solved.includes(id);

  const add = id => {
    if (!has(id)) state.solved.push(id);
    save();
    renderEvidence();
    updateCorruption();
  };

  const seen = id => {
    if (!state.seen.includes(id)) state.seen.push(id);
    save();
    updateCorruption();
  };

  const go = page => {
    $$(".page").forEach(p => {
      p.classList.toggle("active", p.id === `page-${page}`);
    });

    $$(".nav-link").forEach(b => {
      b.classList.toggle("selected", b.dataset.page === page);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (page === "guestbook") {
      state.guestbookRead = true;
      seen("guestbook");
    }

    if (page === "downloads") seen("downloads");
    if (page === "backup") seen("backup");
    if (page === "console") seen("console");
  };

  const popup = (message, title = "SYSTEM MESSAGE") => {
    $("#overlay-title").textContent = title;
    $("#overlay-copy").textContent = message;
    $("#overlay").classList.remove("hidden");
  };

  const printConsole = message => {
    const out = $("#console-output");
    out.textContent += `\n\n${message}`;
    out.scrollTop = out.scrollHeight;
  };

  const renderEvidence = () => {
    const list = $("#evidence-list");
    if (!list) return;

    list.replaceChildren();

    const labels = {
      clock: "Missing folder identified: CLOCK",
      copies: "Duplicate log entries are copies, not witnesses",
      reverse: "Transcript instruction verified: reverse the date order",
      date: "Date sequence reconstructed: 14-11-02",
      identity: "The archive's remembered name is DINGLEFORKTOENAIL"
    };

    const found = state.solved.filter(k => labels[k]);

    if (!found.length) {
      const li = document.createElement("li");
      li.className = "muted";
      li.textContent = "No verified evidence yet.";
      list.append(li);
      return;
    }

    found.forEach(k => {
      const li = document.createElement("li");
      li.textContent = labels[k];
      list.append(li);
    });
  };

  const updateCorruption = () => {
    const n = state.solved.length + state.seen.length;

    if (n >= 4) document.body.classList.add("corrupted");
    if (n >= 8) document.body.classList.add("late");
    if (n >= 11) document.body.classList.add("very-late");

    if (n >= 5 && state.strangeCount === 0) {
      state.strangeCount = 1;
      save();
    }
  };

  const revealBackup = () => {
    state.backupUnlocked = true;
    save();
    go("backup");

    popup(
      "Directory index restored. The files disagree about what happened. Treat repeated testimony as a single source.",
      "OLD_BACKUP/"
    );
  };

  const openFile = key => {
    const f = files[key];
    if (!f) return;

    $("#file-title").textContent = f.title;
    $("#file-content").textContent = f.text;
    $("#file-viewer").classList.remove("hidden");

    seen(`file-${key}`);

    if (key === "log") seen("log");
    if (key === "calendar") seen("calendar");
    if (key === "inventory") seen("inventory");
  };

  $$("[data-page]").forEach(b => {
    b.addEventListener("click", () => go(b.dataset.page));
  });

  $$("[data-file]").forEach(b => {
    b.addEventListener("click", () => openFile(b.dataset.file));
  });

  $("#close-file").addEventListener("click", () => {
    $("#file-viewer").classList.add("hidden");
  });

  $("#backup-link").addEventListener("click", e => {
    e.preventDefault();

    if (state.backupUnlocked) {
      go("backup");
    } else {
      popup(
        "The server says this directory is not indexed. The updates might tell you what to inspect next.",
        "404 — DIRECTORY NOT LISTED"
      );
    }
  });

  $$("[data-external]").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      popup(
        "This link no longer exists. The webmaster never replaced it.",
        "LINK ERROR"
      );
    });
  });

  $$("[data-secret-file]").forEach(b => {
    b.addEventListener("click", () => {
      const key = b.dataset.secretFile;
      const f = files[key];

      if (!f) return;

      const viewer = $("#backup-viewer");
      $("#backup-title").textContent = f.title;
      $("#backup-viewer pre").textContent = f.text;
      viewer.classList.remove("hidden");

      seen(`backup-${key}`);
    });
  });

  $("#close-backup").addEventListener("click", () => {
    $("#backup-viewer").classList.add("hidden");
  });

  $("#unlisted").addEventListener("click", () => {
    if (!has("clock")) {
      popup(
        "ITEM LOCKED. The directory index is missing a folder. Identify it before opening the unlisted record.",
        "ACCESS DENIED"
      );
    } else {
      state.consoleUnlocked = true;
      save();
      go("console");
      printConsole("UNLISTED RECORD FOUND. The archive console is now available.");
    }
  });

  $("#guest-form").addEventListener("submit", e => {
    e.preventDefault();

    const name = $("#guest-name").value.trim();
    const message = $("#guest-message").value.trim();

    if (!name || !message) return;

    const entry = document.createElement("div");
    entry.className = "entry";

    const b = document.createElement("b");
    b.textContent = name;

    const span = document.createElement("span");
    span.textContent = "just now";

    const p = document.createElement("p");
    p.textContent = message;

    entry.append(b, span, p);
    $("#guest-entries").prepend(entry);

    $("#guest-name").value = "";
    $("#guest-message").value = "";

    popup(
      "Entry saved in this browser only. It will not be sent to anyone.",
      "GUESTBOOK"
    );
  });

  let typed = "";

  document.addEventListener("keydown", e => {
    if (
      e.ctrlKey ||
      e.altKey ||
      e.metaKey ||
      e.target.matches("input,textarea")
    ) return;

    typed = (typed + e.key.toLowerCase()).slice(-24);

    if (typed.endsWith("dinglefork")) {
      state.consoleUnlocked = true;
      save();
      go("console");

      printConsole(
        "OWNER NAME ACCEPTED. Console mounted.\nThe owner name was not the first key."
      );

      typed = "";
    }
  });

  $("#footer-mark").addEventListener("click", () => {
    state.strangeCount++;
    save();

    if (state.strangeCount >= 4) {
      document.body.classList.add("late");

      popup(
        "Please stop checking the footer. There is nothing else down there.\n\n— D.F.",
        "A NOTE FROM THE WEBMASTER"
      );
    } else {
      popup("© 2003 D.F. All rights reserved.");
    }
  });

  const commands = [
    "help",
    "ls",
    "status",
    "open <filename>",
    "answer <word or sequence>",
    "evidence",
    "clear",
    "endings",
    "reset"
  ];

  $("#console-form").addEventListener("submit", e => {
    e.preventDefault();

    const raw = $("#command").value.trim();
    $("#command").value = "";

    if (!raw) return;

    const [head, ...rest] = raw.split(/\s+/);
    const arg = rest.join(" ");
    const cmd = head.toLowerCase();

    let result = "";

    if (!state.consoleUnlocked) {
      result = "CONSOLE NOT MOUNTED. Find the owner's name in the site's own records.";
    }

    else if (cmd === "help") {
      result =
        "COMMANDS\n" +
        commands.join("\n") +
        "\n\nThe answer command checks the current lock. Answers must be supported by evidence.";
    }

    else if (cmd === "ls") {
      result =
        "ROOT: readme.txt inventory.txt old_log.txt calendar.txt\n" +
        "BACKUP: hidden until the first lock is solved\n" +
        "SYSTEM: console";
    }

    else if (cmd === "status") {
      result =
        `Verified evidence: ${state.solved.length}\n` +
        `Backup index: ${state.backupUnlocked ? "restored" : "missing"}\n` +
        `Final record: ${state.finalUnlocked ? "available" : "sealed"}`;
    }

    else if (cmd === "open") {
      const key = arg.toLowerCase().replace(/\.txt$|\.log$|\.html$/g, "");

      const map = {
        readme: "readme",
        inventory: "inventory",
        old_log: "log",
        log: "log",
        calendar: "calendar"
      };

      if (map[key]) {
        openFile(map[key]);
        result = `OPENED ${files[map[key]].title} in Downloads.`;
        go("downloads");
      }

      else if (state.backupUnlocked && files[key]) {
        const f = files[key];

        $("#backup-title").textContent = f.title;
        $("#backup-viewer pre").textContent = f.text;
        $("#backup-viewer").classList.remove("hidden");

        go("backup");
        result = `OPENED ${f.title}.`;
      }

      else {
        result = "FILE NOT FOUND OR DIRECTORY NOT INDEXED.";
      }
    }

    else if (cmd === "answer") {
      const a = arg.toLowerCase().replace(/[^a-z0-9]/g, "");

      if (!has("clock")) {
        if (a === "clock") {
          add("clock");
          state.backupUnlocked = true;
          save();

          result =
            "FIRST LOCK VERIFIED. Missing folder restored: old_backup/. Inspect every file, especially the copy receipt.";
        } else {
          result =
            "INCORRECT. The inventory describes the missing folder without naming it directly.";
        }
      }

      else if (!has("copies")) {
        if (a === "one" || a === "1" || a === "onewitness") {
          add("copies");

          result =
            "SOURCE CHECK PASSED. Three identical copies count as one witness. Now compare the transcript with the calendar.";
        } else {
          result =
            "INCORRECT. How many independent witnesses are there if all copies came from the same copy?";
        }
      }

      else if (!has("reverse")) {
        if (a === "reverse" || a === "backwards") {
          add("reverse");

          result =
            "INSTRUCTION VERIFIED. Read the three month/day pairs from the latest to the earliest: 10/14, 10/11, 10/02. Keep only the day numbers.";
        } else {
          result =
            "INCORRECT. The transcript gives a direct instruction. Follow it literally.";
        }
      }

      else if (!has("date")) {
        if (a === "141102" || a === "14110203" || a === "1411022003") {
          add("date");

          result =
            "DATE SEQUENCE ACCEPTED. The sequence is evidence, not the final password. Find what the old index says is the archive's remembered name.";
        } else {
          result =
            "INCORRECT. Use the dates in reverse chronological order. Keep the day numbers only, with no punctuation.";
        }
      }

      else if (!has("identity")) {
        if (a === "dingleforktoenail") {
          add("identity");
          state.finalUnlocked = true;
          save();

          result =
            "IDENTITY VERIFIED. The final record is available. Type: endings";
        } else {
          result =
            "INCORRECT. The old index says the path has three pieces. Join them without spaces.";
        }
      }

      else {
        result = "All locks are already verified. Type endings to choose a record.";
      }
    }

    else if (cmd === "evidence") {
      result = state.solved.length
        ? "VERIFIED: " + state.solved.join(", ")
        : "No evidence verified yet.";
    }

    else if (cmd === "endings") {
      if (!state.finalUnlocked) {
        result = "FINAL RECORD SEALED. Verify all five evidence steps first.";
      } else {
        showEndings();
        result = "Final record opened. Choose an ending on the page.";
      }
    }

    else if (cmd === "clear") {
      $("#console-output").textContent = "DFA-03 console ready.";
      return;
    }

    else if (cmd === "reset") {
      if (confirm("Erase this browser's DingleFork investigation progress?")) {
        localStorage.removeItem(STORE);
        location.reload();
      }
      return;
    }

    else {
      result = "UNKNOWN COMMAND. Type help.";
    }

    printConsole(`> ${raw}\n${result}`);
    save();
    renderEvidence();
    updateCorruption();
  });

  function showEndings() {
    go("ending");

    const section = $("#page-ending");

    section.innerHTML = `
      <article class="paper ending">
        <p class="kicker">FINAL RECORD · SELECT ONE</p>
        <h2>What should be preserved?</h2>
        <p>The archive has recorded your findings. Choose what you believe should happen to the last copy.</p>

        <div class="ending-options">
          <button class="classic" data-ending="preserve">PRESERVE THE RECORD</button>
          <button class="classic" data-ending="erase">ERASE THE RECORD</button>
          <button class="classic" data-ending="publish">PUBLISH THE RECORD</button>
        </div>

        <div id="ending-result"></div>

        <button class="classic" id="restart">Return to homepage</button>
      </article>
    `;

    $$("[data-ending]", section).forEach(b => {
      b.addEventListener("click", () => finish(b.dataset.ending));
    });

    $("#restart").addEventListener("click", () => go("home"));
  }

  function finish(kind) {
    const endings = {
      preserve: {
        title: "ENDING 1: THE PRESERVATION",
        text: "You kept the archive intact. The copies remain in their folders, each one insisting it is the original. A new file appears in the inventory: visitor_list (2)."
      },

      erase: {
        title: "ENDING 2: THE CLEAN COPY",
        text: "You removed the record from this browser. The homepage looks normal again. The visitor counter has not changed, but the site status now says: WAITING FOR THE NEXT VISITOR."
      },

      publish: {
        title: "ENDING 3: THE PUBLIC MIRROR",
        text: "You made the evidence public. The transcript is no longer alone. Somewhere, a new guestbook entry appears with no name and no date: 'There were only three of us yesterday.'"
      }
    };

    state.endings.push(kind);
    save();

    $("#ending-result").innerHTML =
      `<h3>${endings[kind].title}</h3><p>${endings[kind].text}</p>`;

    document.body.classList.add("ending-reached");
  }

  $("#restart").addEventListener("click", () => go("home"));

  $("#overlay-ok").addEventListener("click", () => {
    $("#overlay").classList.add("hidden");
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      $("#overlay").classList.add("hidden");
    }
  });

  $("#last-checked").textContent = "10/15/03";

  $("#counter").textContent = String(
    184 + Math.min(999, state.seen.length * 3)
  ).padStart(6, "0");

  if (state.backupUnlocked) {
    const l = $("#backup-link");
    l.textContent = "old backup directory [restored]";
  }

  renderEvidence();
  updateCorruption();

  // Typing the webmaster's name mounts the console.
})();
