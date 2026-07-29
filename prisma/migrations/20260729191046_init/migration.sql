-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hhUserId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiresAt" DATETIME,
    "lastSyncedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hhId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "vacancyId" TEXT,
    "vacancyName" TEXT,
    "vacancyUrl" TEXT,
    "employerId" TEXT,
    "employerName" TEXT,
    "employerLogoUrl" TEXT,
    "areaName" TEXT,
    "salaryFrom" INTEGER,
    "salaryTo" INTEGER,
    "salaryCurrency" TEXT,
    "salaryGross" BOOLEAN,
    "stateId" TEXT,
    "stateName" TEXT,
    "employerStateId" TEXT,
    "employerStateName" TEXT,
    "resumeId" TEXT,
    "resumeTitle" TEXT,
    "hasUpdates" BOOLEAN NOT NULL DEFAULT false,
    "hhCreatedAt" DATETIME,
    "hhUpdatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "imported" INTEGER NOT NULL DEFAULT 0,
    "updated" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "SyncLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_hhUserId_key" ON "User"("hhUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_hhId_key" ON "Application"("hhId");

-- CreateIndex
CREATE INDEX "Application_userId_hhCreatedAt_idx" ON "Application"("userId", "hhCreatedAt");

-- CreateIndex
CREATE INDEX "Application_employerName_idx" ON "Application"("employerName");

-- CreateIndex
CREATE INDEX "Application_stateId_idx" ON "Application"("stateId");
