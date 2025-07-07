import "./Posts.css";
import { Avatar } from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RepeatIcon from "@mui/icons-material/Repeat";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PublishIcon from "@mui/icons-material/Publish";
import { useState, useRef, useEffect } from "react";

const Posts = ({ p }) => {
  const { name, username, photo, post, profilephoto, audio, video } = p;

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [iscomments, setiscomments] = useState(false);
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
  }, [video]);

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
          setiscomments(!iscomments);
          console.log("clickcounter is 3, no action defined yet.");
        }
      } else if (xwidth > width / 3 && xwidth <= (width / 3) * 2) {
        if(clickcounter.current === 3 ) {
          const confirm = window.confirm("Do you want to close the page");
          if(confirm) {
            window.close();
          } else {
            console.log("User chose not to close the page.");
          }
        }
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
    <div className="post">
      <div className="post__avatar">
        <Avatar src={profilephoto} />
      </div>
      <div className="post__body">
        <div className="post__header">
          <div className="post__headerText">
            <h3>
              {name}{" "}
              <span className="post__headerSpecial">
                <VerifiedUserIcon className="post__badge" /> @{username}
              </span>
            </h3>
          </div>
          <div className="post__headerDescription">
            <p>{post}</p>
          </div>
        </div>
        <img src={photo} alt="" width="500" className="post_image" />
        {audio ? (
          <div>
            <audio controls src={audio} className="post_audio" />
          </div>
        ) : null}
        {video ? (
          <>
            <div className="container">
              <video
                src={video}
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
        ) : null}

        {/* comment section */}
        {iscomments ? (
          <div className="comment-container">
          <div className="post__comments">No comment yet</div>
        </div>
        ):null  
        }

        <div className="post__footer">
          <ChatBubbleOutlineIcon
            className="post__fotter__icon"
            fontSize="small"
            onClick={() => setiscomments(!iscomments)}
          />
          <RepeatIcon className="post__fotter__icon" fontSize="small" />
          <FavoriteBorderIcon className="post__fotter__icon" fontSize="small" />
          <PublishIcon className="post__fotter__icon" fontSize="small" />
        </div>
      </div>
    </div>
  );
};

export default Posts;
