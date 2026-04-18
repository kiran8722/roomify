import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
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

const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg"];
const ACCEPTED_FILE_TYPES = ".png,.jpg,.jpeg,image/png,image/jpeg";

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

  const processFile = (file: File | null | undefined) => {
    if (!isSignedIn) {
      return;
    }

    if (!file || !ALLOWED_FILE_TYPES.includes(file.type)) {
      return;
    }

    clearTimers();
    setIsDragging(false);
    setFileName(file.name);
    setProgress(0);
    setStatus("uploading");

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result;
      if (typeof base64Data !== "string") {
        return;
      }

      let currentProgress = 0;
      intervalRef.current = window.setInterval(() => {
        currentProgress = Math.min(100, currentProgress + PROGRESS_STEP);
        setProgress(currentProgress);

        if (currentProgress >= 100) {
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setStatus("complete");
          timeoutRef.current = window.setTimeout(() => {
            onComplete(base64Data);
          }, REDIRECT_DELAY_MS);
        }
      }, PROGRESS_INTERVAL_MS);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) {
      return;
    }
    processFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isSignedIn) {
      return;
    }
    setIsDragging(true);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isSignedIn) {
      return;
    }
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isSignedIn) {
      return;
    }
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isSignedIn) {
      return;
    }
    setIsDragging(false);
    const dropFile = event.dataTransfer.files[0];
    processFile(dropFile);
  };

  return (
    <div className="upload">
      {status === "idle" ? (
        <div
          className={`dropzone${isDragging ? " is-dragging" : ""}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-disabled={!isSignedIn}
        >
          <input
            className="drop-input"
            type="file"
            accept={ACCEPTED_FILE_TYPES}
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
