-- CreateTable
CREATE TABLE "mcp_api_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "token_prefix" TEXT NOT NULL,
    "last_used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mcp_api_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mcp_api_tokens_token_hash_key" ON "mcp_api_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "mcp_api_tokens_user_id_idx" ON "mcp_api_tokens"("user_id");

-- CreateIndex
CREATE INDEX "mcp_api_tokens_token_hash_idx" ON "mcp_api_tokens"("token_hash");

-- AddForeignKey
ALTER TABLE "mcp_api_tokens" ADD CONSTRAINT "mcp_api_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
