#!/bin/bash
set -ueE -o pipefail

mkdir -p ./out
npx rollup --config ./rollup.config.js --input ./source/index.js --file ./out/index.js --format iife
echo '<script type="text/discourse-plugin" version="0.8.18">' > common/header.html
cat out/index.js >> common/header.html
echo "</script>" >> common/header.html
rm -Rf ./out