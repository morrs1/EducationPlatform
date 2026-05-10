#!/bin/sh
set -e

echo 'Running taskiq scheduler...'
taskiq scheduler answer_service.scheduler:create_scheduler_taskiq_app -fsd -tp **/tasks/*.py
