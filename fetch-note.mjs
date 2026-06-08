// note の RSS を取得して、必要な情報だけ note.json に保存するスクリプト。
// 外部ライブラリは使わず、Node.js だけで動くようにしてあります。

const NOTE_USER = "nekoz_17";          // ← あなたの note ユーザー名
const COUNT = 5;                        // ← 表示する件数
const RSS_URL = `https://note.com/${NOTE_USER}/rss`;

// タグを抜き出すための、ごく簡単なヘルパー
function pick(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  if (!m) return "";
  return m[1]
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .trim();
}
// サムネイルは <media:thumbnail>URL</media:thumbnail> 形式
function pickThumb(block) {
  const m = block.match(/<media:thumbnail>([\s\S]*?)<\/media:thumbnail>/);
  return m ? m[1].trim() : "";
}

const res = await fetch(RSS_URL, { headers: { "User-Agent": "anim-note-bot" } });
if (!res.ok) {
  console.error("RSS の取得に失敗しました:", res.status);
  process.exit(1);
}
const xml = await res.text();

// <item>...</item> をすべて取り出す
const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);

const posts = items.slice(0, COUNT).map(block => {
  // タイトルから note 独自の付加情報を除き、素のテキストに
  const title = pick(block, "title");
  const link = pick(block, "link");
  const pubDate = pick(block, "pubDate");
  const thumbnail = pickThumb(block);
  // 日付を 2026.06.08 の形に整える
  let date = "";
  const d = new Date(pubDate);
  if (!isNaN(d)) {
    date = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
  }
  return { title, link, date, thumbnail };
});

const out = { updated: new Date().toISOString(), posts };
await import("node:fs/promises").then(fs =>
  fs.writeFile("note.json", JSON.stringify(out, null, 2), "utf-8")
);
console.log(`note.json を書き出しました（${posts.length}件）`);
