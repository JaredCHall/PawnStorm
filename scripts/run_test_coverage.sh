#!/bin/bash

# Removes bash color tags and dev's home dir from output
home_dir=$(eval echo ~)
deno task test-unit --clean --coverage=cov_profile && deno coverage cov_profile | sed -r -e "s/\\x1B\\[[0-9;]*[mK]//g" -e "s|$home_dir||g" | tee tests/coverage-report.txt