import { useState, useRef, useEffect } from "react";
import "./Tweetbox.css";
import { Avatar, Button } from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import VideoCameraBackIcon from "@mui/icons-material/VideoCameraBack";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import MicOffIcon from "@mui/icons-material/MicOff";
import axios from "axios";
import { useUserAuth } from "../../../context/UserAuthContext";
import useLoggedinuser from "../../../hooks/useLoggedinuser";
import OtpPopup from "./OtpPopup";

const Tweetbox = () => {
  const [post, setpost] = useState("");
  const [imageurl, setimageurl] = useState("");
  const [isloading, setisloading] = useState(false);
  const { user } = useUserAuth();
  const [loggedinuser] = useLoggedinuser();
  const email = user?.email;
  const userprofilepic = loggedinuser[0]?.profileImage || user?.photoURL || "";
  const [otpcheck, setotpcheck] = useState(false);
  const [otpsent, setotpsent] = useState(false);
  const [otp, setotp] = useState("");
  const [isrecording, setisrecording] = useState(false);
  const [recordings, setRecordings] = useState(null);
  const [Audioblog, setAudioblog] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const audioChunks = useRef([]);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  const [videoUrl, setvideoUrl] = useState(null);
  const [video, setVideo] = useState(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef();
  const clickcounter = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const percent = (video.currentTime / video.duration) * 100;
      setProgress(percent || 0);
      setCurrentTime(video.currentTime);
    };

    const handleMetadataLoaded = () => {
      setDuration(video.duration);
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("loadedmetadata", handleMetadataLoaded);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("loadedmetadata", handleMetadataLoaded);
    };
  }, [videoUrl]);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("video/")) {
      const videoUrl = URL.createObjectURL(file);
      setvideoUrl(videoUrl);
      setVideo(file)
    } else {
      alert("Please upload a valid video file.");
    }
  };

  const handleclick = (e) => {
    clickcounter.current += 1;

    let video = videoRef.current;
    let DOM = e.target.getBoundingClientRect();
    let xwidth = e.clientX - DOM.left;
    let width = DOM.width;

    setTimeout(() => {
      if (xwidth <= width / 3) {
        if (clickcounter.current === 2) {
          video.currentTime = Math.max(video.currentTime - 10, 0);
          video.play();
          console.log("Moved backward by 10 seconds.");
        } else if (clickcounter.current === 3) {
          console.log("clickcounter is 3, no action defined yet.");
        }
      } else if (xwidth > width / 3 && xwidth <= (width / 3) * 2) {
        console.log("Click in the middle section.");
      } else {
        if (clickcounter.current === 2) {
          video.currentTime = Math.min(video.currentTime + 10, video.duration);
          console.log("Moved forward by 10 seconds.");
          video.play();
        } else if (clickcounter.current === 3) {
          console.log("clickcounter is 3, no action defined yet.");
        }
      }

      clickcounter.current = 0;
    }, 500);

    if (clickcounter.current === 1) {
      if (!video) return;
      video.paused ? video.play() : video.pause();
    }
  };

  const handlechange = (e) => {
    const video = videoRef.current;
    const actualtime = (e.target.value / 100) * duration;
    video.currentTime = actualtime;
    setProgress(e.target.value);
  };

  const handleuploadimage = (e) => {
    setisloading(true);
    const image = e.target.files[0];
    const formData = new FormData();
    formData.set("image", image);

    axios
      .post(
        "https://api.imgbb.com/1/upload?key=b0ea2f6cc0f276633b2a8a86d2c43335",
        formData
      )
      .then((res) => {
        setimageurl(res.data.data.display_url);
        setisloading(false);
      })
      .catch((e) => {
        console.error("Image upload failed:", e);
        setisloading(false);
      });
  };

  const Audioupload = async () => {
    if (Audioblog) {
      const formData = new FormData();
      formData.append("audio", Audioblog);
      try {
        const response = await axios.post(
          "http://localhost:5000/audio/uploadaudio",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const audioUrl = response.data.url;
        return audioUrl;
      } catch (error) {
        console.error("Audio upload failed:", error);
      }
    }
  };

  const videoUpload = async () => {
       if (video) {
      const formData = new FormData();
      formData.append("video", video);
      try {
        const response = await axios.post(
          "http://localhost:5000/video/uploadvideo",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("Video upload response:", response);
        const Cloudvideourl = response.data.url;
        setvideoUrl(null); 
        return Cloudvideourl;
      } catch (error) {
        console.error("Audio upload failed:", error);
      }
    }
  }

  const handletweet = async (e) => {
    e.preventDefault();

    const audioUrl = await Audioupload();

    const Cloudvideourl  = await videoUpload();
  
    const postTweet = (name, username) => {
      const userpost = {
        profilephoto: userprofilepic,
        post,
        photo: imageurl,
        username,
        name,
        email,
        audio: audioUrl || "",
        video: Cloudvideourl || "",
      };


      console.log("User Post Data:", userpost);

      fetch("https://twiller-twitterclone-aku2.onrender.com/post", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(userpost),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Posted:", data);
          setpost("");
          setimageurl("");
          setotp("");
          setotpsent(false);
          setotpcheck(false);
          setRecordings(null);
        })
        .catch((err) => console.error("Error posting tweet:", err));
    };

    if (user?.providerData[0]?.providerId === "password") {
      fetch(
        `https://twiller-twitterclone-aku2.onrender.com/loggedinuser?email=${email}`
      )
        .then((res) => res.json())
        .then((data) => {
          const name = data[0]?.name;
          const username = data[0]?.username;
          postTweet(name, username);
        })
        .catch((err) => console.error("User data fetch error:", err));
    } else {
      const name = user?.displayName;
      const username = email?.split("@")[0];
      postTweet(name, username);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!recordings) {
      handletweet(e);
    } else if (!otpcheck) {
      handleotpsent();
    } else {
      handletweet(e);
    }
  };

  const checktime = () => {
    const now = new Date();
    const istOffset = 330;
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const istTime = new Date(utc + 60000 * istOffset);

    const hour = istTime.getHours();

    if (hour < 14 || hour >= 19) {
      alert("Audio upload is allowed only between 2:00 PM and 7:00 PM IST.");
      return false;
    }

    return true;
  };

  const handleStartRecording = async () => {
    const allowed = checktime();
    if (!allowed) return;

    setisrecording(true);
    setRecordings(null);
    setRecordingTime(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioChunks.current = [];
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setisrecording(false);
        if (timerRef.current) clearInterval(timerRef.current);

        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const size = audioBlob.size / (1024 * 1024);

        if (size > 100) {
          alert("Recording must be less than 100 MB");
          return;
        }

        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordings(audioUrl);
        setAudioblog(audioBlob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      let elapsedTime = 0;
      timerRef.current = setInterval(() => {
        elapsedTime += 1;
        setRecordingTime(elapsedTime);

        if (elapsedTime >= 300) {
          alert("Recording cannot be more than 5 minutes");
          mediaRecorder.stop();
          clearInterval(timerRef.current);
        }
      }, 1000);
    } catch (error) {
      console.error("Microphone access denied or not available", error);
    }
  };

  const handleStopRecording = () => {
    setisrecording(false);
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
    }
  };

  const handleotpsent = async () => {
    try {
      const response = await axios.post("http://localhost:5000/sendotp", {
        email,
      });
      setotpsent(true);
      console.log("OTP sent:", response.data);
    } catch (error) {
      console.error("OTP send error:", error);
    }
  };

  const handleOTPSubmit = async (otp) => {
    try {
      const response = await axios.get("http://localhost:5000/otpverify", {
        email,
        otp,
      });
      setotpcheck(true);
      handleclose();
    } catch (error) {
      console.error("OTP verify error:", error);
    }
  };

  const handleclose = () => {
    setotpsent(false);
    setotp("");
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="tweetBox">
      <form onSubmit={handleFormSubmit}>
        <div className="tweetBox__input">
          <Avatar src={userprofilepic} />
          <input
            type="text"
            placeholder="What's happening?"
            onChange={(e) => setpost(e.target.value)}
            value={post}
            required
          />
        </div>

        <div className="imageIcon_container">
          <div className="imageIcon_tweetButton">
            <label htmlFor="image" className="imageIcon">
              {isloading ? (
                <p>Uploading Image</p>
              ) : (
                <p>
                  {imageurl ? (
                    "Image Uploaded"
                  ) : (
                    <AddPhotoAlternateOutlinedIcon />
                  )}
                </p>
              )}
            </label>
            <input
              type="file"
              id="image"
              className="imageInput"
              onChange={handleuploadimage}
              accept="image/*"
            />

            <button
              className="micIcon"
              type="button"
              onClick={isrecording ? handleStopRecording : handleStartRecording}
            >
              {isrecording ? (
                <div className="micIcon_container">
                  <MicOffIcon />
                  <h1 className="mictext">{formatTime(recordingTime)}</h1>
                </div>
              ) : (
                <MicNoneOutlinedIcon />
              )}
            </button>

            <label className="micIcon cursor-pointer">
              <VideoCameraBackIcon />
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />
            </label>
          </div>

          <Button className="tweetBox__tweetButton" type="submit">
            {!recordings ? "Tweet" : otpcheck ? "Tweet" : "Send OTP"}
          </Button>
        </div>
      </form>

      {otpsent && (
        <OtpPopup
          otp={otp}
          setotp={setotp}
          onSubmit={handleOTPSubmit}
          onClose={handleclose}
        />
      )}

      {recordings && (
        <div className="audio_wrapper">
          <audio
            controls
            autoPlay
            src={recordings}
            className="recordingAudio"
          />
        </div>
      )}

      {videoUrl && (
        <>
          <div className="container">
            <video
              src={videoUrl}
              ref={videoRef}
              onClick={handleclick}
              className="video"
            />
            <div className="progressbar-container">
              <div className="progressbar-time">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handlechange}
                className="progressBar"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Tweetbox;
