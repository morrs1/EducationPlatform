#!/bin/sh
set -e

echo 'Starting FastStream app...'

faststream run --factory answer_service.faststream_app:create_faststream_app
