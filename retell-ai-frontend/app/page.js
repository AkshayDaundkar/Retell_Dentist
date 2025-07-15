"use client";

import React, { useState, useEffect, useRef } from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import Head from "next/head";
import "./page.css";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [callStatus, setCallStatus] = useState("Ready to call");
  const [retellWebClient, setRetellWebClient] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const transcriptRef = useRef(null);

  // ✅ Only allow rendering on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; // Prevent SSR hydration issues

    setIsMobile(window.innerWidth <= 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    const client = new RetellWebClient();
    setRetellWebClient(client);

    client.on("call_started", () => {
      setCallStatus("Call active - Say something!");
      setIsCallActive(true);
    });

    client.on("call_ended", () => {
      setCallStatus("Call ended");
      setIsCallActive(false);
    });

    client.on("update", (update) => {
      let transcriptText = "";
      if (update.transcript) {
        if (typeof update.transcript === "string") {
          transcriptText = update.transcript;
        } else if (Array.isArray(update.transcript)) {
          transcriptText = update.transcript
            .map(
              (item) =>
                `${item.role === "agent" ? "Grace" : "You"}: ${item.content}`
            )
            .join("\n\n");
        }
        setTranscript(transcriptText);
      }
    });

    client.on("error", (error) => {
      setCallStatus(`Error: ${error.message || "Unknown error"}`);
    });

    return () => {
      client.removeAllListeners();
      window.removeEventListener("resize", handleResize);
    };
  }, [isClient]);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  const startCall = async () => {
    try {
      setCallStatus("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setCallStatus("Creating call...");
      const response = await fetch(
        `https://retell-dentist.onrender.com/create-web-call?t=${Date.now()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );
      const data = await response.json();
      if (!data.success || !data.access_token) {
        throw new Error(data.error || "Failed to get access token");
      }
      if (retellWebClient) {
        await retellWebClient.startCall({
          accessToken: data.access_token,
          sampleRate: 24000,
          captureDeviceId: "default",
          playbackDeviceId: "default",
        });
      }
      setCallStatus("Call starting...");
    } catch (error) {
      if (error.name === "NotAllowedError") {
        setCallStatus(
          "Microphone access denied. Please allow microphone access and try again."
        );
      } else {
        setCallStatus(`Error: ${error.message}`);
      }
    }
  };

  const stopCall = async () => {
    try {
      if (retellWebClient) {
        await retellWebClient.stopCall();
      }
      setCallStatus("Call stopped");
      setIsCallActive(false);
    } catch (error) {}
  };

  // ✅ ✅ Fix hydration issue: return nothing until isClient true
  if (!isClient) return null;

  return (
    <>
      <Head>
        <title>Meet Akshay - The Future Is Now</title>
      </Head>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      {/* Rest of your UI stays unchanged */}
      <div className="main-bg">
        <div className="glass-card">
          {/* Logo */}
          <div className="logo-row">
            <img
              src="https://marketplace.canva.com/EAFzZ7HIqYo/1/0/1600w/canva-blue-and-white-minimal-dental-care-logo-D-_h-rJgSAk.jpg"
              alt="Logo"
              className="logo-img"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
          <div className="content-row">
            <div className="audio-col">
              <div
                className={`mic-sphere ${isCallActive ? "active" : ""}`}
                onClick={isCallActive ? stopCall : startCall}
              >
                🎤
              </div>
              <button
                className={`call-btn ${isCallActive ? "end" : "start"}`}
                onClick={isCallActive ? stopCall : startCall}
              >
                {isCallActive ? "End Call" : "Start Call"}
              </button>
              <div className="call-status">{callStatus}</div>
            </div>

            <div className="transcript-col">
              <h2 className="transcript-title">Live Transcript</h2>
              <div className="transcript-box" ref={transcriptRef}>
                {transcript ? (
                  <div>
                    {transcript.split("\n\n").map((line, index) => (
                      <div key={index} className="bubble user">
                        <div className="bubble-content">{line}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="transcript-placeholder">
                    Your conversation will appear here in real-time...
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="powered-row">
            <span className="powered-text">POWERED BY Akshay Daundkar</span>
          </div>
        </div>
      </div>
    </>
  );
}
