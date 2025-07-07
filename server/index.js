const { MongoClient, ServerApiVersion } = require("mongodb");

const express = require("express");
const cors = require("cors");
const uri =
"mongodb+srv://Admin:qwerty98710@twiller.e0xnj0s.mongodb.net/?retryWrites=true&w=majority&appName=Twiller";
const port = 5000;
const app = express();
app.use(express.json());
app.use(cors());

const multer = require("multer");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.use("/uploads", express.static("uploads"));

const client = new MongoClient(uri);

const nodemailer = require("nodemailer");
const otpstore = {};
const dotenv = require("dotenv");
dotenv.config();

async function run() {
  try {
    await client.connect();
    const postcollection = client.db("database").collection("posts");
    const usercollection = client.db("database").collection("users");
    app.post("/register", async (req, res) => {
      const user = req.body;
      // console.log(user)
      const result = await usercollection.insertOne(user);
      res.send(result);
    });

    app.get("/loggedinuser", async (req, res) => {
      const email = req.query.email;
      const user = await usercollection.find({ email: email }).toArray();
      res.send(user);
    });
    

    app.post("/post", async (req, res) => {
      const post = req.body;
      const result = await postcollection.insertOne(post);
      res.send(result);
    });

    app.get("/post", async (req, res) => {
      const post = (await postcollection.find().toArray()).reverse();
      res.send(post);
    });

    app.get("/userpost", async (req, res) => {
      const email = req.query.email;
      const post = (
        await postcollection.find({ email: email }).toArray()
      ).reverse();
      res.send(post);
    });

    app.get("/user", async (req, res) => {
      const user = await usercollection.find().toArray();
      res.send(user);
    });

    app.patch("/userupdate/:email", async (req, res) => {
      const filter = req.params;
      const profile = req.body;
      const options = { upsert: true };
      const updateDoc = { $set: profile };
      // console.log(profile)
      const result = await usercollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    //handling otps

    app.post("/sendotp", async (req, res) => {
      console.log("Sending OTP...");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "Email is required" });

      const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
      otpstore[email] = otp;

      try {
        const info = await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Your OTP Code",
          text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
        });

        setTimeout(() => {
          delete otpstore[email];
        }, [5 * 60 * 1000]);

        console.log("Email sent: ", info.response);
        return res.json({ success: true }); 
      } catch (error) {
        res.status(500).json({ error: "Failed to send OTP" });
        console.log(error);
      }
    });

    app.get("/otpverify", async (req, res) => {
      const { email, otp } = req.body;
      if (otpstore[email] === Number(otp) || otpstore[email] === otp) {
        delete otpstore[email];
        return res.status(200).json({ message: "ok" });
      } else {
        return res.status(400).json({ message: "not ok " });
      }
    });

    //

    // handling audio upload

    const audioUploadRoute = require("./routes/audio");

    app.use("/audio", audioUploadRoute);
    
    //

    const videoUploadRoute = require("./routes/video");
    app.use("/video", videoUploadRoute);

  } catch (error) {
    console.log(error);
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Twiller is working");
});

app.listen(port, () => {
  console.log(`Twiller clone is workingon ${port}`);
});
