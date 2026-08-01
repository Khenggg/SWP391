import { delay, http } from "msw";
import { API_BASE_URLS, MOCK_FLAGS, isMockEnabled } from "../mockConfig";
import { badRequest, ok } from "./helpers";

const VALID_IMAGE_TYPES = new Set([
  "ENTRY_PLATE",
  "ENTRY_VEHICLE",
  "EXIT_PLATE",
  "EXIT_VEHICLE",
]);

let nextSnapshotId = Date.now();

const shouldMockSnapshots =
  isMockEnabled(MOCK_FLAGS.STAFF_ENTRY) || isMockEnabled(MOCK_FLAGS.STAFF_EXIT);

export const snapshotHandlers = shouldMockSnapshots
  ? [
      http.post(`${API_BASE_URLS.core}/parking-image-snapshots`, async ({ request }) => {
        await delay(150);
        const payload = await request.json();

        if (!VALID_IMAGE_TYPES.has(payload?.imageType) || !payload?.imageSource) {
          return badRequest("Thieu anh hoac loai snapshot khong hop le.");
        }

        nextSnapshotId += 1;
        const isPlate = payload.imageType.endsWith("_PLATE");

        return ok({
          id: nextSnapshotId,
          snapshotId: nextSnapshotId,
          snapshotToken: `mock-snapshot-${nextSnapshotId}`,
          sessionId: payload.sessionId ?? null,
          imageType: payload.imageType,
          imageUrl: payload.imageSource,
          uploadStatus: "UPLOADED",
          ocrStatus: isPlate ? "PENDING" : "NOT_REQUESTED",
          detectedPlateNumber: null,
          detectedNormalizedPlateNumber: null,
          confidence: null,
          capturedAt: payload.capturedAt ?? new Date().toISOString(),
        });
      }),
    ]
  : [];
