
(() => {
  "use strict";

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const state = {
    seen: new Set(),
    solved: new Set(),
    endings: new Set(),
    strangeCount: 0,
    guestbookRead: false,
    consoleUnlocked: false,
    hiddenFound: false
  };

  const files = {
    readme: {
      title: "readme.txt",
      text: `HELLO!

Thanks for visiting my homepage.
Everything here is normal and very much under control.

If you find a file called 'old_log.txt', please don't edit it.
I don't remember writing it, but it keeps coming back.

- DingleFork`
    },

    inventory: {
      title: "inventory.txt",
      text: `ARCHIVE INVENTORY / 10-14-03

01. photographs (12)
02. school notes (31)
03. web scraps (7)
04. visitor list (1)

NOTE: There should be six folders.
NOTE: There are five folders.
NOTE: Stop counting the folders.`
    },

    log: {
      title: "old_log.txt",
      text: `10/02/03  homepage created
10/11/03  guestbook fixed
10/14/03  backup completed
10/14/03  backup completed
10/14/03  backup completed

10/15/03  visitor detected
10/15/03  visitor detected
10/15/03  visitor detected

There is no 10/15/03 entry in the calendar.

If you're reading this, the archive has started noticing you.`
    },

    note: {
      title: "note_to_self.txt",
      text: `NOTE TO SELF

The old key is not a key.
The date is not a date.
The name is not a name.

Count what is missing, not what is here.

Seven is the answer to a question nobody asked.`
    },

    transcript: {
      title: "visitor_transcript.log",
      text: `VISITOR LOG — LOCAL COPY

VISITOR 001: hello, nice site
VISITOR 002: where is the owner?
VISITOR 003: why is my name in the source?
VISITOR 004: I didn't type that

VISITOR 005: DingleFork, if this is a joke, stop.

[RECORD CONTINUES]
VISITOR 006: you are reading this out of order`
    },

    index: {
      title: "index_old.html",
      text: `OLD INDEX NOTES

The path is made from three pieces:
DINGLE / FORK / TOENAIL

Do not put spaces between them.
Do not search for the path on a search engine.
The path only exists here.`
    }
  };

  function go(page) {
    $$(".page").forEach(p => {
      p.classList.toggle("active", p.id === `page-${page}`);
    });

    $$(".nav-link").forEach(b => {
      b.classList.toggle("selected", b.dataset.page === page);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function popup(message, title = "SYSTEM MESSAGE") {
    $("#overlay-title").textContent = title;
    $("#overlay-copy").textContent = message;
    $("#overlay").classList.remove("hidden");
    $("#overlay-ok").focus();
  }

  $("#overlay-ok").addEventListener("click", () => {
    $("#overlay").classList.add("hidden");
  });

  $("#overlay").addEventListener("click", e => {
    if (e.target === $("#overlay")) {
      $("#overlay").classList.add("hidden");
    }
  });

  function showFile(key) {
    const item = files[key];
    if (!item) return;

    $("#file-title").textContent = item.title;
    $("#file-content").textContent = item.text;
    $("#file-viewer").classList.remove("hidden");

    state.seen.add(key);
    checkProgress();

    if (key === "log" && state.strangeCount > 0) {
      $("#file-content").textContent +=
        "\n\nADDENDUM:\nYou have been here before. The counter remembers.";
    }
  }

  $$(".nav-link").forEach(btn => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.page;
      go(page);
      state.seen.add(page);

      if (page === "guestbook" && !state.guestbookRead) {
        state.guestbookRead = true;
        state.strangeCount++;

        window.setTimeout(() => {
          const entries = $("#guest-entries");

          if (!$("#odd-entry", entries)) {
            const odd = document.createElement("div");
            odd.id = "odd-entry";
            odd.className = "entry";

            const name = document.createElement("b");
            name.textContent = "DingleFork";

            const date = document.createElement("span");
            date.textContent = "10/15/03";

            const msg = document.createElement("p");
            msg.textContent =
              "I don't remember signing this. Do you?";

            odd.append(name, date, msg);
            entries.prepend(odd);
          }

          corrupt(
            "A new guestbook entry appeared while you were looking at the page."
          );
        }, 1800);
      }

      checkProgress();
    });
  });

  $$("[data-external]").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      popup(
        "That link doesn't work anymore. The internet was smaller back then."
      );
    });
  });

  $("#backup-link").addEventListener("click", e => {
    e.preventDefault();
    state.seen.add("backup");
    state.strangeCount++;
    go("backup");

    corrupt(
      "You found a directory that was not linked in the original menu."
    );

    checkProgress();
  });

  $$("[data-file]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.file;
      showFile(key);

      if (key === "log" && !state.solved.has("log")) {
        state.solved.add("log");

        popup(
          "Notice the impossible date: 10/15/03. Remember it.",
          "FILE READ"
        );
      }
    });
  });

  $("#close-file").addEventListener("click", () => {
    $("#file-viewer").classList.add("hidden");
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

    const date = document.createElement("span");
    date.textContent = "just now";

    const p = document.createElement("p");
    p.textContent = message;

    entry.append(b, date, p);
    $("#guest-entries").prepend(entry);

    $("#guest-name").value = "";
    $("#guest-message").value = "";

    state.solved.add("guest");

    if (/dingleforktoenail/i.test(message.replace(/\s/g, ""))) {
      state.solved.add("name");

      popup(
        "The guestbook accepted the name.\nIt should not have known what you meant.",
        "ENTRY SAVED"
      );

      corrupt("A name has been spoken in the archive.");
    } else {
      popup("Thanks for signing the guestbook!");
    }

    checkProgress();
  });

  $$("[data-secret-file]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.secretFile;
      const viewer = $("#backup-viewer");

      viewer.classList.remove("hidden");
      $("pre", viewer).textContent = files[key].text;
      state.seen.add(key);

      if (key === "note") {
        state.solved.add("seven");

        popup(
          "The note says to count what is missing. The inventory lists five folders, but claims there should be six. Look for the missing folder.",
          "CLUE FOUND"
        );
      }

      if (key === "transcript") {
        state.solved.add("transcript");

        popup(
          "The visitor log says you're reading the records out of order. The date 10/15/03 may be a key, not a date.",
          "CLUE FOUND"
        );
      }

      if (key === "index") {
        state.solved.add("path");

        popup(
          "Three pieces. No spaces. Keep the full name in mind.",
          "CLUE FOUND"
        );
      }

      checkProgress();
    });
  });

  $("#unlisted").addEventListener("click", () => {
    state.hiddenFound = true;
    state.solved.add("unlisted");

    $("#backup-viewer").classList.remove("hidden");

    $("pre", $("#backup-viewer")).textContent =
      `unlisted_item.dat

DINGLEFORKTOENAIL

This is not a password.
It is a label.

CONSOLE ROUTE: /archive-console
ENTRY DATE: 10/15/03
KEY: 0707`;

    state.consoleUnlocked = true;

    corrupt("A hidden file has been indexed.");

    popup(
      "Hidden item recovered.\nThe string is a label, and 0707 is the first key. Find the console.",
      "UNLISTED FILE"
    );

    checkProgress();
  });

  $("#footer-mark").addEventListener("click", () => {
    state.strangeCount++;

    if (state.strangeCount < 2) {
      popup(
        "Copyright 2003. All rights reserved.\n\nWhy are you clicking the footer?"
      );
    } else {
      state.solved.add("footer");

      popup(
        "D.F. = DingleFork.\nD.F.T. = DingleForkToenail.\n\nThe initials were never meant to be a clue.",
        "FOOTER NOTE"
      );

      corrupt("The footer has stopped pretending to be decorative.");
    }

    checkProgress();
  });

  const commandHelp = `COMMANDS
help      list commands
ls        list archive routes
status    show recovered clues
open      open hidden console record
unlock    try a key (usage: unlock 0707)
whoami    identify the current visitor
clear     clear console output`;

  const printConsole = text => {
    $("#console-output").textContent = text;
  };

  $("#console-form").addEventListener("submit", e => {
    e.preventDefault();

    const raw = $("#command").value.trim();
    const cmd = raw.toLowerCase();

    $("#command").value = "";
    if (!cmd) return;

    state.seen.add("console");

    let result = "";

    if (cmd === "help") {
      result = commandHelp;
    } else if (cmd === "ls") {
      result =
        "home.html\nabout.html\ndownloads/\nguestbook/\nold_backup/ [hidden]\narchive-console/ [unlisted]";
    } else if (cmd === "status") {
      result =
        `Files read: ${state.seen.size}\n` +
        `Clues found: ${state.solved.size}\n` +
        `Archive stability: ${state.strangeCount > 2 ? "POOR" : "NORMAL"}\n` +
        "Owner status: NOT AVAILABLE";
    } else if (cmd === "whoami") {
      result =
        "VISITOR 007\n\nYou are not listed in the guestbook.\nYou are listed in the backup.";
    } else if (cmd === "clear") {
      result = "";
    } else if (cmd === "open") {
      if (state.consoleUnlocked || state.solved.has("path")) {
        result =
          "RECORD 07\nDINGLEFORKTOENAIL\n\n" +
          "The owner did not disappear.\n" +
          "The owner was split into three parts:\n" +
          "DINGLE / FORK / TOENAIL\n\n" +
          "If you can read this, the archive is waiting for a final choice.";

        state.solved.add("record");
      } else {
        result =
          "ACCESS DENIED. The unlisted item has not been indexed.";
      }
    } else if (cmd === "unlock 0707") {
      if (
        state.solved.has("seven") ||
        state.hiddenFound ||
        state.seen.has("log")
      ) {
        state.consoleUnlocked = true;
        state.solved.add("console-key");

        result = "KEY ACCEPTED.\nConsole record available. Type: open";

        corrupt("The console accepted a key.");
      } else {
        result =
          "KEY REJECTED.\nFind the impossible date and the missing folder first.";
      }
    } else if (
      cmd === "unlock 101503" ||
      cmd === "unlock 10/15/03"
    ) {
      if (
        state.solved.has("transcript") &&
        state.solved.has("seven")
      ) {
        state.consoleUnlocked = true;
        state.solved.add("date-key");

        result = "DATE ACCEPTED.\nThe second lock is open. Type: open";
      } else {
        result =
          "DATE REJECTED. You need the visitor transcript and the missing-folder clue.";
      }
    } else if (cmd.startsWith("unlock ")) {
      result = "KEY REJECTED. Check the clues again.";
    } else {
      result = `UNKNOWN COMMAND: ${raw}\nType help.`;
    }

    printConsole(`> ${raw}\n${result}`);
    checkProgress();
  });

  function checkProgress() {
    const count = state.solved.size + state.seen.size;

    if (count >= 3) {
      document.body.classList.add("corrupted");
    }

    if (count >= 7) {
      document.body.classList.add("late");
    }

    if (
      state.solved.has("record") &&
      state.solved.has("date-key")
    ) {
      if (!$("#final-route")) {
        const btn = document.createElement("button");

        btn.id = "final-route";
        btn.className = "classic";
        btn.textContent = "Open final record";

        btn.addEventListener("click", showFinalChoice);

        $("#page-console .paper").append(btn);
      }
    }
  }

  function corrupt(message) {
    state.strangeCount++;

    document.body.classList.add("corrupted");

    if (state.strangeCount >= 3) {
      document.body.classList.add("late");
    }

    if (state.strangeCount === 2) {
      $("#last-checked").textContent = "10/15/03";
      $("#counter").textContent = "000007";
      $("#site").setAttribute("data-observed", "true");
    }

    if (state.strangeCount >= 4) {
      $("#counter").textContent = "000001";
      $("#last-checked").textContent = "just now";
    }

    if (message && state.strangeCount === 1) {
      window.setTimeout(() => popup(message, "ARCHIVE NOTICE"), 450);
    }
  }

  function showFinalChoice() {
    go("ending");

    $("#ending-title").textContent = "THE LAST RECORD";
    $("#ending-copy").innerHTML = "";

    const p = document.createElement("p");

    p.textContent =
      "The archive is quiet now. Three pieces have become one name. You can close the record, leave the archive open, or erase the copy you found.";

    $("#ending-copy").append(p);

    const choices = [
      [
        "close",
        "CLOSE THE ARCHIVE",
        "You close the file. The homepage returns to normal, except the visitor counter now reads 000007. The archive is quiet, but not gone. ENDING A: CLOSED RECORD."
      ],
      [
        "stay",
        "LEAVE IT OPEN",
        "You leave the console running. A new line appears: 'THANK YOU FOR KEEPING MY PLACE.' The page remains open for the next visitor. ENDING B: THE KEEPER."
      ],
      [
        "erase",
        "ERASE THE LOCAL COPY",
        "The files disappear from the visible directory. The site looks normal again. In the footer, the initials have changed to D.F.T. ENDING C: CLEANUP."
      ]
    ];

    choices.forEach(([key, label, text]) => {
      const b = document.createElement("button");

      b.className = "classic choice";
      b.textContent = label;

      b.addEventListener("click", () => finish(key, text));

      $("#ending-copy").append(b);
    });
  }

  function finish(key, text) {
    state.endings.add(key);

    $("#ending-copy").textContent = text;

    $("#ending-title").textContent =
      key === "close"
        ? "ENDING A: CLOSED RECORD"
        : key === "stay"
        ? "ENDING B: THE KEEPER"
        : "ENDING C: CLEANUP";

    document.body.classList.toggle("late", key !== "close");
  }

  $("#restart").addEventListener("click", () => {
    go("home");

    popup(
      "The homepage has been restored.\n\nSome things may still be different.",
      "WELCOME BACK"
    );
  });

  // Secret keyboard sequence: type dinglefork outside text fields.
  let keyBuffer = "";

  document.addEventListener("keydown", e => {
    if (
      ["INPUT", "TEXTAREA"].includes(
        document.activeElement.tagName
      )
    ) {
      return;
    }

    keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-13);

    if (keyBuffer.endsWith("dinglefork")) {
      state.consoleUnlocked = true;
      state.solved.add("name");

      go("console");

      printConsole(
        "IDENTITY STRING ACCEPTED.\nTry: unlock 0707\n\nThe archive knows the name."
      );

      corrupt("A hidden keyboard route has opened.");
    }

    if (e.key === "Escape") {
      $("#overlay").classList.add("hidden");
    }
  });

  // Click the date after it changes to investigate the discrepancy.
  $("#last-checked").addEventListener("click", () => {
    state.solved.add("date");

    popup(
      "10/15/03 does not exist in the update list.\nTry entering 101503 at the console after finding the missing-folder clue.",
      "DATE DISCREPANCY"
    );
  });

  // Subtle status change after the visitor has explored.
  window.setTimeout(() => {
    if (!state.seen.size) return;

    const status = $(".status p:first-of-type");

    if (status && !document.body.classList.contains("late")) {
      status.innerHTML =
        '<span class="green-dot"></span> Everything is working. Probably.';
    }
  }, 18000);

  // Decorative counter. No analytics or remote calls.
  $("#counter").textContent = "000184";
})();
