const express = require("express");
const fs = require("fs");
require("dotenv").config();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { initializeApp, cert } = require("firebase-admin/app");
const { getStorage } = require("firebase-admin/storage");

const serviceAccount = require("./serviceKey.json");

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "store-my-files-2eca7.appspot.com",
});

const bucket = getStorage().bucket();

const app = express();

const PORT = process.env.PORT || 8000;

app.post("/", upload.array("files"), async (req, res) => {
  console.log(req.files);
  req.files.forEach(async (file) => {
    await bucket.file(file.originalname).save(file.buffer);
  });
  res.send("File uploaded");
});

app.get("/:fileName", async (req, res) => {
  const fileName = req.params.fileName;
  const file = await bucket.file(fileName).download({ destination: fileName });
  res.sendFile(__dirname + `/${fileName}`);
  setTimeout(() => {
    fs.unlink(__dirname + `/${fileName}`, () => {
      console.log("File deleted");
    });
  }, 5 * 1000);
});

app.listen(PORT, () => {
  console.log(`Listening in ${PORT}`);
});
