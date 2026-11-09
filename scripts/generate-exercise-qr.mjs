import QRCode from "qrcode";
import { readFile, writeFile } from "node:fs/promises";
const catalog = JSON.parse(
  await readFile("content/exercise_catalog.json", "utf8"),
);
for (const card of catalog.cards)
  await writeFile(
    card.qrFile,
    await QRCode.toString(card.qrPayload, {
      type: "svg",
      margin: 4,
      errorCorrectionLevel: "M",
    }),
  );
