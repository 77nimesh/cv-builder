-- prisma/migrations/20260420100000_phase_b2_image_asset_foundation/migration.sql
-- CreateTable
CREATE TABLE "ImageAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'resume-photo',
    "storageProvider" TEXT NOT NULL DEFAULT 'local',
    "storageKey" TEXT NOT NULL,
    "sourceFileName" TEXT,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ImageAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ImageAsset_storageKey_key" ON "ImageAsset"("storageKey");

-- CreateIndex
CREATE INDEX "ImageAsset_userId_createdAt_idx" ON "ImageAsset"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ImageAsset_userId_kind_idx" ON "ImageAsset"("userId", "kind");

PRAGMA foreign_keys=OFF;

-- RedefineTable
CREATE TABLE "new_Resume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "template" TEXT NOT NULL DEFAULT 'modern-1',
    "themeColor" TEXT,
    "fontFamily" TEXT,
    "data" JSONB NOT NULL,
    "photoPath" TEXT,
    "photoAssetId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Resume_photoAssetId_fkey" FOREIGN KEY ("photoAssetId") REFERENCES "ImageAsset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_Resume" (
    "id",
    "userId",
    "title",
    "template",
    "themeColor",
    "fontFamily",
    "data",
    "photoPath",
    "photoAssetId",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "userId",
    "title",
    "template",
    "themeColor",
    "fontFamily",
    "data",
    "photoPath",
    NULL,
    "createdAt",
    "updatedAt"
FROM "Resume";

DROP TABLE "Resume";

ALTER TABLE "new_Resume" RENAME TO "Resume";

-- CreateIndex
CREATE INDEX "Resume_userId_idx" ON "Resume"("userId");

-- CreateIndex
CREATE INDEX "Resume_photoAssetId_idx" ON "Resume"("photoAssetId");

PRAGMA foreign_keys=ON;