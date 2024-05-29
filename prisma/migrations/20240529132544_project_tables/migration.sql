-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "id_group" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "hourValue" DOUBLE PRECISION NOT NULL,
    "hasBankHours" BOOLEAN NOT NULL,
    "contractTotal" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_groups" (
    "id" TEXT NOT NULL,
    "id_resource" TEXT NOT NULL,
    "id_group" TEXT NOT NULL,

    CONSTRAINT "resource_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recover_passwords" (
    "id" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "recover_passwords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_hours" (
    "id" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hour" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "bank_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "releases" (
    "id" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "holiday" BOOLEAN NOT NULL,
    "start_hour" TEXT NOT NULL,
    "end_hour" TEXT NOT NULL,
    "total" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "total_hours" DOUBLE PRECISION NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "hour_value" DOUBLE PRECISION NOT NULL,
    "total_value" DOUBLE PRECISION NOT NULL,
    "current_time_bank" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "recover_passwords_id_user_key" ON "recover_passwords"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "bank_hours_id_user_key" ON "bank_hours"("id_user");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_group_fkey" FOREIGN KEY ("id_group") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_groups" ADD CONSTRAINT "resource_groups_id_resource_fkey" FOREIGN KEY ("id_resource") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_groups" ADD CONSTRAINT "resource_groups_id_group_fkey" FOREIGN KEY ("id_group") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recover_passwords" ADD CONSTRAINT "recover_passwords_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_hours" ADD CONSTRAINT "bank_hours_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "releases" ADD CONSTRAINT "releases_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
