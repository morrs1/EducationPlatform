#!/bin/sh
set -e

echo 'Running taskiq worker...'
taskiq worker --ack-type when_saved answer_service.worker:create_worker_taskiq_app -fsd -tp **/tasks/*.py