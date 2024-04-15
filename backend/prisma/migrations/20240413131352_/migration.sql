/*
  Warnings:

  - You are about to drop the column `MCAdress` on the `RunningRecording` table. All the data in the column will be lost.
  - Added the required column `MCAddress` to the `RunningRecording` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RunningRecording" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "MCAddress" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_RunningRecording" ("date", "id") SELECT "date", "id" FROM "RunningRecording";
DROP TABLE "RunningRecording";
ALTER TABLE "new_RunningRecording" RENAME TO "RunningRecording";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
