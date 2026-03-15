#!/bin/sh
set -e

echo 'Starting FastStream app...'

faststream run answer_service.faststream_app:create_faststream_app
