const Neynar = require("@neynar/nodejs-sdk");

const client = new Neynar.NeynarAPIClient(process.env.NEYNAR_API_KEY);
const SIGNER_UUID = process.env.SIGNER_UUID;
const FID = process.env.FID;

const KEYWORDS = ["base", "defi", "swap", "crypto", "ethereum", "farcaster"];

const COMMENTS = [
  "Great point! 🔥",
  "Love seeing this on Farcaster! 🚀",
  "This is amazing! Keep building! 💪",
  "100% agree with this! 🙌",
  "Great stuff on Base! 🔵",
  "This is the future of DeFi! ⚡",
  "Bullish on this! 📈",
];

function getRandomComment() {
  return COMMENTS[Math.floor(Math.random() * COMMENTS.length)];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  try {
    console.log("🤖 Bot starting...");

    const feed = await client.fetchFeed("following", { fid: FID, limit: 20 });
    const casts = feed.casts;
    console.log(`📥 Fetched ${casts.length} casts`);

    let likeCount = 0;
    let commentCount = 0;

    for (const cast of casts) {
      if (likeCount >= 5) break;

      await client.reactToCast(SIGNER_UUID, "like", cast.hash);
      likeCount++;
      console.log(`❤️ Liked cast: ${cast.hash}`);
      await sleep(Math.random() * 3000 + 2000);

      const text = cast.text?.toLowerCase() || "";
      const hasKeyword = KEYWORDS.some((kw) => text.includes(kw));

      if (hasKeyword && commentCount < 2) {
        const comment = getRandomComment();
        await client.publishCast(SIGNER_UUID, comment, {
          replyTo: cast.hash,
        });
        commentCount++;
        console.log(`💬 Commented on cast: ${cast.hash}`);
        await sleep(Math.random() * 5000 + 3000);
      }
    }

    console.log(`✅ Done! Liked: ${likeCount}, Commented: ${commentCount}`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

run();
