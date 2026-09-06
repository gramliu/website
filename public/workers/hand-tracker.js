/* Classic worker: the MediaPipe WASM loader uses importScripts. */
let detector;
let canvas;
self.onmessage = async ({ data }) => {
  try {
    if (data.type === "init") {
      importScripts("/hand-tracker/vision_bundle.js");
      const vision =
        await Vision.FilesetResolver.forVisionTasks("/hand-tracker/wasm");
      detector = await Vision.HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
        minHandDetectionConfidence: 0.6,
        minHandPresenceConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });
      self.postMessage({ type: "ready" });
    } else if (data.type === "frame" && detector) {
      try {
        // Infer on the same mirrored image the user sees, including handedness.
        if (
          !canvas ||
          canvas.width !== data.frame.width ||
          canvas.height !== data.frame.height
        ) {
          canvas = new OffscreenCanvas(data.frame.width, data.frame.height);
        }
        const context = canvas.getContext("2d");
        context.setTransform(-1, 0, 0, 1, canvas.width, 0);
        context.drawImage(data.frame, 0, 0);
        const result = detector.detectForVideo(canvas, data.timestamp);
        self.postMessage({
          type: "result",
          timestamp: data.timestamp,
          hands: result.landmarks.map((landmarks, index) => ({
            side: result.handedness[index][0].categoryName,
            score: result.handedness[index][0].score,
            landmarks,
          })),
        });
      } finally {
        data.frame.close();
      }
    }
  } catch (error) {
    self.postMessage({ type: "error", message: String(error) });
  }
};
