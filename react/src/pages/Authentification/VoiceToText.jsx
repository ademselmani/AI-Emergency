import React from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const VoiceToTextButton = ({ onTranscript }) => {
  const { transcript, resetTranscript } = useSpeechRecognition();

  const handleMouseDown = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true });
  };

  const handleMouseUp = () => {
    SpeechRecognition.stopListening();
    onTranscript(transcript); // send transcript when done
  };

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <span>🎙️ Your browser doesn’t support voice input</span>;
  }

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      className="btn btn-outline-secondary"
    >
      🎤 Hold to speak
    </button>
  );
};

export default VoiceToTextButton;
