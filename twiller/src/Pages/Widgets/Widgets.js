import React, { useState } from "react";
import "./widget.css";
import SearchIcon from "@mui/icons-material/Search";
import { TwitterTimelineEmbed, TwitterTweetEmbed } from "react-twitter-embed";
import CloudIcon from "@mui/icons-material/Cloud";
import Post from "../Feed/Posts/Posts";

const Widgets = () => {
  const [tweetbox, settweetbox] = useState(false);
  const handleclick = () => {
    settweetbox(!tweetbox);
  };
  const [input, setInput] = useState("");
  const [post, setpost] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);

  const handleSend = (e) => {
    e.preventDefault();

    if (input) {
    fetch("http://localhost:5000/post")
      .then((res) => res.json())
      .then((data) => {
        setpost(data);
        const filtered = data.filter((p) =>
          p.post.toLowerCase().includes(input.toLowerCase())
        );
        setFilteredPosts(filtered);
        setInput("");
      });
    }
  };
  return (
    <div className="widgets">
      <div className="widgets__input">
        <SearchIcon className="widget__searchIcon" />
        <input placeholder="Search Twitter" type="text" />
      </div>
      <div className="widgets__widgetContainer">
        <h2>What's Happening</h2>
        <TwitterTweetEmbed tweetId={"1816174440071241866"} />
        <TwitterTimelineEmbed
          sourceType="profile"
          screenName="Valorant"
          options={{ height: 400 }}
        />
      </div>
      <div className="tweetbox" onClick={handleclick}>
        <CloudIcon />
      </div>
      {tweetbox && (
         <div className="tweetbox-main">
          <div>
            <h5>Search for Tweets</h5>
          </div>
          <div className="tweetreply">
          {filteredPosts.length > 0 &&
            filteredPosts.map((p) => (
              <div key={p._id} className="post-item">
                <Post p={p} />
              </div>
            ))}
          </div>
          <form className="chatbox-input" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Ask about tweets..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Widgets;
