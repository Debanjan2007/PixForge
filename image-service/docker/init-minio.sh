#!/bin/sh

echo "Waiting for MinIO..."

max_retries=20
count=0

until mc alias set local http://minio:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD 2>/dev/null
do
  count=$((count+1))
  echo "MinIO not ready yet... ($count)"

  if [ $count -ge $max_retries ]; then
    echo "MinIO never became ready. Exiting."
    exit 1
  fi

  sleep 2
done

echo "MinIO is ready!"

# Ensure bucket exists
mc mb local/media || true

# 🔥 Configure webhook ONLY if not already set
mc admin config get local notify_webhook:1 >/dev/null 2>&1 || \
mc admin config set local notify_webhook:1 \
  endpoint="http://host.docker.internal:4500/storage-events" \
  queue_limit="10"

# Remove old event
mc event remove local/media arn:minio:sqs::1:webhook || true

# Add event
mc event add local/media arn:minio:sqs::1:webhook --event put

echo "MinIO event configured"