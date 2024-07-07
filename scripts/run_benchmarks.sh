#!/bin/bash

set -euo pipefail

# Removes bash color tags and dev's home dir from output
home_dir=$(eval echo ~)
deno bench --allow-read --allow-run | sed -r -e "s/\\x1B\\[[0-9;]*[mK]//g" -e "s|$home_dir||g" | tee benchmarks/benchmark-results.txt