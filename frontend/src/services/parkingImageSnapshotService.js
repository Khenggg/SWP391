import coreAxiosClient from "../api/coreAxiosClient";

function unwrap(response) {
  if (response?.success) return response.data;
  throw new Error(response?.message || "Không thể lưu ảnh snapshot.");
}

export const parkingImageSnapshotService = {
  async upload({ imageSource, imageType, sessionId = null, capturedAt = null }) {
    const response = await coreAxiosClient.post("/parking-image-snapshots", {
      imageSource,
      imageType,
      sessionId,
      capturedAt,
    });

    return unwrap(response);
  },
};
