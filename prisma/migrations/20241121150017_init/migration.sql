-- CreateEnum
CREATE TYPE "Plans" AS ENUM ('FREE', 'PAID');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('CREATED', 'QUEUED', 'INPROGRESS', 'DONE');

-- CreateTable
CREATE TABLE "Audio" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "length" DECIMAL(10,2) NOT NULL,
    "audioPublicId" VARCHAR(255) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "transcription" TEXT,
    "status" "Status" NOT NULL,

    CONSTRAINT "Audio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "imageUrl" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "plan" "Plans" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "clerkId" VARCHAR(255) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- AddForeignKey
ALTER TABLE "Audio" ADD CONSTRAINT "Audio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;
