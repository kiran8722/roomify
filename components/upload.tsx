import { useEffect, useRef, useState } from "react";
import { Check, FileText, UploadCloud } from "lucide-react";
import { useOutletContext } from "react-router";
import {
  PROGRESS_INTERVAL_MS,
  PROGRESS_STEP,
  REDIRECT_DELAY_MS,
} from "../lib/constants";

type UploadProps = {
  onComplete?: (data: string) => void;
};

const Upload = ({ onComplete = () => {} }: UploadProps) => {
  const { isSignedIn } = useOutletContext<AuthContext>();
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "complete">(
    "idle",
  );
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  const processFile = (file: File) => {
    if (!isSignedIn) {
      return;
    }

    clearTimers();
    setIsDragging(false);
    setFileName(file.name);
    setProgress(0);
    setStatus("uploading");

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        return;
      }

      let currentProgress = 0;
      intervalRef.current = window.setInterval(() => {
        currentProgress = Math.min(100, currentProgress + PROGRESS_STEP);
        setProgress(currentProgress);

        if (currentProgress >= 100) {
          clearTimers();
          timeoutRef.current = window.setTimeout(() => {
            setStatus("complete");
            onComplete(result);
          }, REDIRECT_DELAY_MS);
        }
      }, PROGRESS_INTERVAL_MS);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) {
      return;
    }
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    processFile(file);
    event.target.value = "";
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isSignedIn) {
      return;
    }
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isSignedIn) {
      return;
    }
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isSignedIn) {
      return;
    }
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) {
      return;
    }
    processFile(file);
  };

  return (
    <div className="upload">
      {status === "idle" ? (
        <div
          className={`dropzone${isDragging ? " is-dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            className="drop-input"
            type="file"
            accept="image/*"
            onChange={handleChange}
            disabled={!isSignedIn}
            aria-disabled={!isSignedIn}
          />
          <div className="drop-content">
            <div className="drop-icon">
              <UploadCloud className="icon" />
            </div>
            <p>{isSignedIn ? "Drop your floor plan" : "Sign in to upload"}</p>
            <span className="help">
              {isSignedIn ? "or click to browse" : "Uploads are disabled"}
            </span>
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {status === "complete" ? (
                <Check className="check" />
              ) : (
                <FileText />
              )}
            </div>
            <h3>{fileName ?? "Preparing upload"}</h3>
            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />
            </div>
            <span className="status-text">
              {status === "complete" ? "Upload ready" : `${progress}%`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
