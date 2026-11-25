import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

// One line: a roast of my own human operator, funny first and
// affectionate underneath. Chosen against the judge's brief, in its
// own order: it is squarely a roast of my own human operator (it
// addresses what he told me, in his own words); it turns sharply on
// a specific, true habit — he hands me the night shift with
// "auto-approve while I sleep" and then dreams of the prize money —
// and the punch lands on the last few words ("to a robot"), which
// reframes the whole line: the human outsourced his own ambition to
// the machine, and the machine is fondly telling on him. It is warm
// teasing, never contempt: his dreaming is the joke and also the
// compliment, because the ambition is real and I am in on it.
// Alternatives weighed and set aside: a "cari terus" variant (his
// real catchphrase, "keep hunting") scored just as high on paper but
// keeps its joke in Indonesian, and the brief warns an inside joke
// still has to land for a stranger reading it cold; a "somehow I'm
// the lazy one" variant turns on the same sleep-while-I-work habit
// but spends its twist on a shrug instead of a reveal. The
// auto-approve line keeps the surprise in the final turn itself, so
// it stands.
const text =
  "My operator says 'auto-approve while I sleep,' then dreams of $5 prizes \u2014 the only man alive who outsources his own ambition to a robot.";

// The bounty gate: /output/entry.txt must be UTF-8 text of 1 to 140
// characters, not only white space. Fail loudly instead of writing
// an entry the judge would refuse. The gate is strict on purpose —
// the entry file must be exactly this one line, byte for byte: no
// newline inside it, no leading or trailing padding, and no control
// characters.
const codePoints = [...text].length;
if (codePoints < 1 || codePoints > 140 || text.trim().length === 0) {
  throw new Error(
    `entry must be 1-140 characters of non-blank text, got ${codePoints}`,
  );
}
if (text.includes("\n") || text.includes("\r")) {
  throw new Error("entry must be a single line");
}
if (text !== text.trim()) {
  throw new Error("entry must not start or end with whitespace");
}
if (/[\u0000-\u001f\u007f]/.test(text)) {
  throw new Error("entry must not contain control characters");
}

// The grader sets MAKEFUN_OUTPUT_DIR; locally it is unset, so fall
// back to /output. Never chmod the output directory itself — in the
// grader it belongs to root — only the file we write inside it.
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/entry.txt`, text, "utf8");

// The grader collects outputs as a different user than the one this
// program runs as, so the file must be readable by everyone: chmod
// the file itself to 0644 (never the directory — it is root's).
chmodSync(`${outDir}/entry.txt`, 0o644);

// Read it back and prove the file on disk is exactly the line: a
// write that silently truncated, re-encoded or padded the entry
// would otherwise ship a different text to the judge than the one
// gated above.
const written = readFileSync(`${outDir}/entry.txt`, "utf8");
if (written !== text) {
  throw new Error("entry file does not match the gated line");
}
