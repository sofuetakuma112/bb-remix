import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import crypto from "crypto";
import "dotenv/config";

const imagesDir = "./seed/images";
const blobsDir = ".wrangler/state/v3/r2/bb-dev/blobs";
// eslint-disable-next-line no-undef
const sqliteFile = process.env.LOCAL_R2_PATH;

function getContentType(imagePath) {
  const extension = path.extname(imagePath).toLowerCase();
  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

// 画像ファイルを読み込んでバイナリに変換し、blobsディレクトリに保存する関数
function convertImageToBlob(imagePath) {
  const imageData = fs.readFileSync(imagePath);
  const hash = crypto.createHash("sha256");
  hash.update(imageData);
  const blobId = hash.digest("hex");
  const blobPath = path.join(blobsDir, blobId);
  fs.writeFileSync(blobPath, imageData);
  return blobId;
}

// SQLiteデータベースに画像の情報を挿入する関数
function insertImageMetadata(imagePath, filenameWithoutExt, blobId) {
  const db = new sqlite3.Database(sqliteFile);
  const imageStats = fs.statSync(imagePath);
  const key = `posts/${filenameWithoutExt}`;
  const version = crypto.randomBytes(16).toString("hex");
  const size = imageStats.size;
  const etag = crypto
    .createHash("md5")
    .update(fs.readFileSync(imagePath))
    .digest("hex");
  const uploaded = Date.now();
  const checksums = "{}";
  const httpMetadata = `{"contentType": "${getContentType(imagePath)}"}`;
  const customMetadata = "{}";

  const insertQuery = `
      INSERT INTO _mf_objects (key, blob_id, version, size, etag, uploaded, checksums, http_metadata, custom_metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  db.run(
    insertQuery,
    [
      key,
      blobId,
      version,
      size,
      etag,
      uploaded,
      checksums,
      httpMetadata,
      customMetadata,
    ],
    (err) => {
      if (err) {
        console.error("Failed to insert image metadata:", err);
      }
      db.close();
    }
  );
}

// ./imagesディレクトリ内の画像ファイルを処理する
fs.readdirSync(imagesDir).forEach((file) => {
  const filenameWithoutExt = file.split(".")[0];
  const imagePath = path.join(imagesDir, file);
  const imageStats = fs.statSync(imagePath);

  if (imageStats.isFile()) {
    const blobId = convertImageToBlob(imagePath);

    const hash = crypto.createHash("sha256");
    hash.update(fs.readFileSync(imagePath));

    insertImageMetadata(imagePath, filenameWithoutExt, blobId);
  }
});
