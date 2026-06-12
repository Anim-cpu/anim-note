// yoru_nekoz の note RSS を取得して code.json に保存するスクリプト。
// 外部ライブラリ不要、Node.js だけで動きます。

const NOTE_USER = "yoru_nekoz";   // ← コード記録用の note ユーザー名
const RSS_URL = `https://note.com/${NOTE_USER}/rss`;

function pick(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  if (!m) return "";
  return m[1].replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").trim();
}
function pickThumb(block) {
  const m = block.match(/<media:thumbnail>([\s\S]*?)<\/media:thumbnail>/);
  return m ? m[1].trim() : "";
}

const res = await fetch(RSS_URL, { headers: { "User-Agent": "nekoz-code-bot" } });
if (!res.ok) {
  console.error("RSS の取得に失敗しました:", res.status);
  process.exit(1);
}
const xml = await res.text();
const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);

const posts = items.map(block => {
  const title = pick(block, "title");
  const link = pick(block, "link");
  const pubDate = pick(block, "pubDate");
  const thumbnail = pickThumb(block);
  let date = "";
  const d = new Date(pubDate);
  if (!isNaN(d)) {
    date = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
  }
  return { title, link, date, thumbnail };
});

const out = { updated: new Date().toISOString(), posts };
await import("node:fs/promises").then(fs =>
  fs.writeFile("code.json", JSON.stringify(out, null, 2), "utf-8")
);
console.log(`code.json を書き出しました（${posts.length}件）`);
