import React, {useState} from "react";
import "./otp.css";

const Otppopup = ({ onSubmit, onClose }) => {
  const [otp, setOtp] = useState("");
  const handlesubmit = () => {
    if (otp.length === 6) {
      onSubmit(otp);
      setOtp(""); // Clear OTP after submission
    } else {
      alert("Please enter a valid 6-digit OTP.");
    }
  };
  return (
    <div className="otp-overlay">
      <div className="otp-popup">
        <h3>🔐 Enter OTP</h3>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          placeholder="Enter 6-digit OTP"
          className="otp-input"
        />
        <div className="otp-buttons">
          <button onClick={handlesubmit} className="submit-btn">
            Submit
          </button>
          <button onClick={onClose} className="close-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Otppopup;
